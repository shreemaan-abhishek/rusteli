"use client";
import { Loader2 } from "lucide-react";
import { CalculatorProps } from "@/types/types";

const Calculator: React.FC<CalculatorProps> = ({ state, setState }) => {
  const { input, result, loading, showError, error } = state;

  const sendToServer = () => {
    setState({
      ...state,
      loading: true,
      result: null,
      error: null,
      showError: false,
    });

    if (!input || input.trim() === "") {
      setState({
        ...state,
        error: "Please enter an expression",
        showError: true,
      });
      return;
    }
    fetch("http://127.0.0.1:8080/compile", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: input,
    })
      .then(async (response) => {
        setState({ ...state, loading: false });
        if (!response.ok) {
          throw new Error(await response.text());
        }

        const wasmBinary = await response.arrayBuffer();
        const wasmModule = await WebAssembly.compile(wasmBinary);
        const wasmInstance = await WebAssembly.instantiate(wasmModule, {});

        if (wasmInstance.exports && wasmInstance.exports.evaluate) {
          const evaluate = wasmInstance.exports.evaluate as CallableFunction;
          const resp = evaluate();
          setState({ ...state, result: resp });
        } else {
          throw new Error("Problem occured with the wasm module");
        }
      })
      .catch((error) => {
        console.log("Failed:" + error);
        setState({ ...state, error: error.toString(), showError: true });
      });
  };

  return (
    <div className="calculator">
      <div className="enclosure">
        <input
          type="text"
          value={input}
          onChange={(e) =>
            setState({
              ...state,
              input: e.target.value,
              result: null,
              error: null,
              showError: false,
            })
          }
          size={Math.max(1, input.length)}
          placeholder="Enter expression"
        />
        {showError && <p className="error">{error}</p>}
        {!loading && !showError && (
          <p id="result">{result !== null && " = " + result}</p>
        )}
      </div>
      <button className="calculate" disabled={loading} onClick={sendToServer}>
        {loading ? <Loader2 className="animate-spin" /> : "Calculate"}
      </button>
    </div>
  );
};

export default Calculator;
