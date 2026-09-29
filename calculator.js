import { CalculatorEngine, validDigitsForBase } from "./calculator-logic.js";

const engine = new CalculatorEngine();
const displayEl = document.getElementById("display");
const decimalButton = document.getElementById("decimal");
const digitButtons = document.querySelectorAll("button[data-digit]");
const modeButtons = document.querySelectorAll("button[data-base]");

function render() {
  displayEl.textContent = engine.display;

  const validDigits = validDigitsForBase(engine.base);
  digitButtons.forEach((button) => {
    button.disabled = !validDigits.includes(button.dataset.digit);
  });
  decimalButton.disabled = engine.base !== "DEC";

  modeButtons.forEach((button) => {
    const isActive = button.dataset.base === engine.base;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

digitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    engine.inputDigit(button.dataset.digit);
    render();
  });
});

decimalButton.addEventListener("click", () => {
  engine.inputDecimal();
  render();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    engine.setBase(button.dataset.base);
    render();
  });
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
