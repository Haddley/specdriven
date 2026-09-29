import { CalculatorEngine, validDigitsForBase } from "./calculator-logic.js";

const engine = new CalculatorEngine();
const displayEl = document.getElementById("display");
const decimalButton = document.getElementById("decimal");
const digitButtons = document.querySelectorAll("button[data-digit]");
const modeButtons = document.querySelectorAll("button[data-base]");
const operatorButtons = document.querySelectorAll("button[data-operator]");
const equalsButton = document.getElementById("equals");
const statToggleButton = document.getElementById("stat-toggle");
const statCountEl = document.getElementById("stat-count");
const statActionButtons = document.querySelectorAll(
  "#stat-add, #stat-sum, #stat-avg, #stat-std"
);

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
    button.disabled = engine.statisticsMode;
  });

  operatorButtons.forEach((button) => {
    button.disabled = engine.statisticsMode;
  });
  equalsButton.disabled = engine.statisticsMode;

  statToggleButton.classList.toggle("active", engine.statisticsMode);
  statToggleButton.setAttribute("aria-pressed", String(engine.statisticsMode));
  statActionButtons.forEach((button) => {
    button.disabled = !engine.statisticsMode;
  });
  statCountEl.textContent = `n=${engine.dataSet.length}`;
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

statToggleButton.addEventListener("click", () => {
  engine.setStatisticsMode(!engine.statisticsMode);
  render();
});

document.getElementById("stat-add").addEventListener("click", () => {
  engine.addToDataSet();
  render();
});

document.getElementById("stat-sum").addEventListener("click", () => {
  engine.computeSum();
  render();
});

document.getElementById("stat-avg").addEventListener("click", () => {
  engine.computeAverage();
  render();
});

document.getElementById("stat-std").addEventListener("click", () => {
  engine.computeStdDev();
  render();
});

render();
