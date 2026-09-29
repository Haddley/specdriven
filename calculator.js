import { CalculatorEngine } from "./calculator-logic.js";

const engine = new CalculatorEngine();
const displayEl = document.getElementById("display");

function render() {
  displayEl.textContent = engine.display;
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

render();
