"use client";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { ShaderProps } from "@/types/types";
import { motion } from "framer-motion";

const Shader: React.FC<ShaderProps> = ({ state, setState }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { shaderInput, shader, shaderLoading, error, showErrorModal } = state;

  const sendToElixirServer = () => {
    setState({ ...state, shaderLoading: true, shader: "" });

    fetch("http://152.42.158.90:4000/", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: shaderInput,
    })
      .then(async (response) => {
        setState({
          ...state,
          shaderLoading: false,
          error: null,
          showErrorModal: false,
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        return response.text();
      })
      .then((code) => {
        if (code.startsWith("```") && code.length >= 3) {
          code = code.replace(/^```.*\n/, "");
        }
        if (code.endsWith("```") && code.length >= 3) {
          code = code.slice(0, -3);
        }
        if (code.endsWith("```\n") && code.length >= 3) {
          code = code.slice(0, -4);
        }
        return code;
      })
      .then((code) => {
        setState({ ...state, shader: code });
      })
      .catch((error) => {
        setState({ ...state, error: error.toString(), showErrorModal: true });
      });
  };
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const canvasRefCurrent = canvasRef.current;
    eval(shader);
  }, [shader]);
  return (
    <div className="item">
      <div className="enclosure">
        <canvas id="shader-canvas" ref={canvasRef}></canvas>
        <pre id="shader-code">
          {shaderLoading ? "Fetching code from backend..." : shader}
        </pre>
      </div>
      <div className="enclosure">
        <input
          type="text"
          value={shaderInput}
          onChange={(e) => setState({ ...state, shaderInput: e.target.value })}
          size={Math.max(1, shaderInput.length)}
          placeholder="Enter Prompt"
        />
        <button disabled={shaderLoading} onClick={sendToElixirServer}>
          {shaderLoading ? <Loader2 className="animate-spin" /> : "Submit"}
        </button>
        {showErrorModal && (
          <div className="modal-overlay">
            <motion.div
              className="modal-content"
              animate={{ x: "0%", y: "0%", opacity: 1 }}
              exit={{ x: "-100%", y: "-100%", opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <h2 className="modal-title">Error</h2>
              <p className="modal-message">{error}</p>
              <button
                className="modal-close-btn"
                onClick={() => setState({ ...state, showErrorModal: false })}
              >
                OK
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shader;
