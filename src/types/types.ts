export type CalculatorState = {
  input: string;
  result: number | null;
  loading: boolean;
  error: string | null;
  showError: boolean;
};

export interface CalculatorProps {
  state: CalculatorState;
  setState: React.Dispatch<React.SetStateAction<CalculatorState>>;
}

export type ShaderState = {
  shaderInput: string;
  shader: string;
  shaderLoading: boolean;
  error: string | null;
  showErrorModal: boolean;
};

export interface ShaderProps {
  state: ShaderState;
  setState: React.Dispatch<React.SetStateAction<ShaderState>>;
}
