'use client'
import { useState } from "react";

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Calculator" | "Shader">("Calculator");

  const sendToServer = () => {
    const inputText = document.querySelector('input[type="text"]') as HTMLInputElement;
    const text = inputText.value;
    
    fetch("http://152.42.158.90:8080/compile", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: '(' + text + ')',
    })
    .then(async (response) => {
      const resultElement = document.getElementById("result") as HTMLParagraphElement;
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const wasmBinary = await response.arrayBuffer();
      const wasmModule = await WebAssembly.compile(wasmBinary);
      const wasmInstance = await WebAssembly.instantiate(wasmModule, {});
  
      if (wasmInstance.exports && wasmInstance.exports.evaluate) {
        const evaluate = wasmInstance.exports.evaluate as CallableFunction;
        const result = evaluate();
        if (resultElement) {
          resultElement.innerText = `= ${result}`;
        }
        console.log(`Result from WASM: ${result}`);
      } else {
        console.error("No exported 'evaluate' function found in the WASM module.");
      }
    })
  };

  const sendToElixirServer = () => {
    const pre = document.getElementById("shader-code") as HTMLPreElement;
    const inputText = document.querySelector('input[type="text"]') as HTMLInputElement;
    const text = inputText.value;
    fetch("http://152.42.158.90:4000/", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: text,
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then((code) => {
      if (code.startsWith('```') && code.length >= 3) {
        code = code.replace(/^```.*\n/, '');
      }
      if (code.endsWith('```') && code.length >= 3) {
        code = code.slice(0, -3);
      }
      if (code.endsWith('```\n') && code.length >= 3) {
        code = code.slice(0, -4);
      }
      return code;
    })
    .then((code) => {
      
      if (pre) {
        pre.innerText = code;
      }
      const shader = new Function(code);
      shader();
    })
    .catch((error) => console.error('Error fetching or executing code:', error));
  }
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", cursor: "pointer", marginBottom: "20px" }}>
        <div
          onClick={() => setActiveTab("Calculator")}
          style={{
            padding: "10px 20px",
            borderBottom: activeTab === "Calculator" ? "3px solid blue" : "none",
            color: activeTab === "Calculator" ? "blue" : "grey",
          }}
        >
          Calculator
        </div>
        <div
          onClick={() => setActiveTab("Shader")}
          style={{
            padding: "10px 20px",
            borderBottom: activeTab === "Shader" ? "3px solid blue" : "none",
            color: activeTab === "Shader" ? "blue" : "grey",
          }}
        >
          Shader Display
        </div>
      </div>

      <div className="main">
        {activeTab === "Calculator" && (
          <div className="calculator">
            <div className="enclosure">
              <input type="text" placeholder="Enter expression" />
              <p id="result">= </p>
            </div>
            <button className="calculate" onClick={() => sendToServer()}>Submit</button>
          </div>
        )}
        {activeTab === "Shader" && (
          <div className="item">
            <div className="enclosure">
              <canvas id="shader-canvas"></canvas>
              <pre id="shader-code">
                Shader Code Goes Here
              </pre>
            </div>
            <div className="enclosure">
              <input type="text" placeholder="Enter Prompt" />
              <button onClick={() => sendToElixirServer()}>Submit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;
