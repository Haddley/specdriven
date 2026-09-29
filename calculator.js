import { CalculatorEngine } from "./calculator-logic.js";

const engine = new CalculatorEngine();
const displayEl = document.getElementById("display");
const baseSelectorEl = document.getElementById("base-selector");
const hexKeysEl = document.getElementById("hex-keys");

function render() {
  displayEl.textContent = engine.display;
  baseSelectorEl.hidden = engine.mode !== "programmer";
  hexKeysEl.hidden = !(engine.mode === "programmer" && engine.base === 16);
}

document.querySelectorAll("button[data-digit]").forEach((button) => {
  button.addEventListener("click", () => {
    engine.inputDigit(button.dataset.digit);
    render();
  });
});

document.getElementById("decimal").addEventListener("click", () => {
  engine.inputDecimal();
  render();
});

document.querySelectorAll("button[data-operator]").forEach((button) => {
  button.addEventListener("click", () => {
    engine.setOperator(button.dataset.operator);
    render();
  });
});

document.getElementById("equals").addEventListener("click", () => {
  engine.equals();
  render();
});

document.getElementById("clear").addEventListener("click", () => {
  engine.clear();
  render();
});

document.querySelectorAll("button[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    engine.setMode(button.dataset.mode);
    render();
  });
});

document.querySelectorAll("button[data-base]").forEach((button) => {
  button.addEventListener("click", () => {
    engine.setBase(Number(button.dataset.base));
    render();
  });
});

render();
