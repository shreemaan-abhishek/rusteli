use actix_web::{post, App, HttpServer, Responder, HttpResponse};
use actix_cors::Cors;
use std::fs;
use std::process::Command;
use evalexpr::eval;

// This function takes a mathematical expression and generates a WASM module
fn generate_wasm(expression: &str) -> Result<Vec<u8>, String> {
    // Check if the expression is a valid mathematical expression
    if eval(expression).is_err() {
        return Err(String::from("Invalid mathematical expression"));
    }
    
    // Surround the expression with parentheses
    let expression = format!("({})", expression);
    // Generate Rust code dynamically based on the expression
    let rust_code = format!(
        r#"
        #[no_mangle]
        pub fn evaluate() -> f64 {{
            {} as f64
        }}
        "#,
        expression
    );

    // Create a new Cargo project for compiling the code into WASM
    if !std::path::Path::new("wasm_project").exists() {
        Command::new("cargo")
            .args(&["new", "wasm_project", "--lib"])
            .output()
            .map_err(|err| format!("Failed to create Cargo project: {}", err))?;

    let cargo_toml = r#"
[package]
name = "wasm_project"
version = "0.1.0"
edition = "2021"

[dependencies]
wasm-bindgen = "0.2.86"

[lib]
crate-type = ["cdylib", "rlib"]
"#;

    fs::write("wasm_project/Cargo.toml", cargo_toml)
        .map_err(|err| format!("Failed to write Cargo.toml: {}", err))?;
    }

    // Write the code to the library file in the project
    fs::write("wasm_project/src/lib.rs", rust_code)
        .map_err(|err| format!("Failed to write lib.rs: {}", err))?;

    // cargo build --target=wasm32-unknown-unknown --release
    let output = Command::new("cargo")
        .args(&["build", "--target", "wasm32-unknown-unknown", "--release"])
        .current_dir("wasm_project")
        .output()
        .map_err(|err| format!("Failed to run cargo build: {}", err))?;

    if !output.status.success() {
        return Err(format!(
            "WASM compilation failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    // Read the generated WASM binary
    let wasm_path = "wasm_project/target/wasm32-unknown-unknown/release/wasm_project.wasm";
    return fs::read(wasm_path).map_err(|err| format!("Failed to read WASM file: {}", err))
}

#[post("/compile")]
async fn compile_expression(body: String) -> impl Responder {
    match generate_wasm(&body) {
        Ok(wasm_binary) => HttpResponse::Ok()
            .content_type("application/wasm")
            .body(wasm_binary),
        Err(err) => HttpResponse::InternalServerError().body(err),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin() // Allows requests from any origin
                    .allow_any_method() // Allows all HTTP methods (GET, POST, etc.)
                    .allow_any_header() // Allows all headers
            )
            .service(compile_expression)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
