"use client";
import { useState } from "react";
import Calculator from "@/components/calculator";
import Shader from "@/components/shader";
import { CalculatorState, ShaderState } from "@/types/types";

const Tabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Calculator" | "Shader">(
    "Calculator"
  );
  // State for both Calculator and Shader
  const [calculatorState, setCalculatorState] = useState<CalculatorState>({
    input: "",
    result: null,
    loading: false,
    error: null,
    showError: false,
  });
  const [shaderState, setShaderState] = useState<ShaderState>({
    shaderInput: "",
    shader: "",
    shaderLoading: false,
    error: null,
    showErrorModal: false,
  });

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", cursor: "pointer", marginBottom: "20px" }}>
        <div
          onClick={() => setActiveTab("Calculator")}
          style={{
            padding: "10px 20px",
            borderBottom:
              activeTab === "Calculator" ? "3px solid blue" : "none",
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
        {activeTab === "Calculator" ? (
          <Calculator state={calculatorState} setState={setCalculatorState} />
        ) : (
          <Shader state={shaderState} setState={setShaderState} />
        )}
      </div>
    </div>
  );
};

export default Tabs;
