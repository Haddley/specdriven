import { CalculatorEngine, isValidDigitForBase, formatNumber } from "./calculator-logic.js";

const engine = new CalculatorEngine();
const displayEl = document.getElementById("display");
const decimalButton = document.getElementById("decimal");
const programmerToggle = document.getElementById("programmer-toggle");
const baseSelector = document.getElementById("base-selector");
const hexKeys = document.getElementById("hex-keys");
const statisticsToggle = document.getElementById("statistics-toggle");
const statsPanel = document.getElementById("stats-panel");
const dataListEl = document.getElementById("data-list");
const digitButtons = document.querySelectorAll("button[data-digit]");
const baseButtons = document.querySelectorAll("button[data-base]");

function render() {
  displayEl.textContent = engine.display;

  // Programmer-Mode-only controls are hidden entirely in Standard mode.
  baseSelector.hidden = !engine.programmerMode;
  hexKeys.hidden = !engine.programmerMode;
  programmerToggle.checked = engine.programmerMode;

  // Only digits valid for the active base are enterable; others are
  // disabled, mirroring real calculators.
  digitButtons.forEach((button) => {
    button.disabled = !isValidDigitForBase(button.dataset.digit, engine.base);
  });

  // Programmer Mode is integer-only: the decimal-point key is disabled
  // while active, in every base.
  decimalButton.disabled = engine.programmerMode;

  // Highlight the active base in the selector.
  baseButtons.forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.base) === engine.base);
  });

  // Statistics-Mode-only controls are hidden entirely outside the mode.
  statsPanel.hidden = !engine.statisticsMode;
  statisticsToggle.checked = engine.statisticsMode;
  dataListEl.textContent = engine.data.map((value) => formatNumber(value, 10)).join(", ");
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

programmerToggle.addEventListener("change", () => {
  engine.setProgrammerMode(programmerToggle.checked);
  render();
});

baseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    engine.setBase(Number(button.dataset.base));
    render();
  });
});

statisticsToggle.addEventListener("change", () => {
  engine.setStatisticsMode(statisticsToggle.checked);
  render();
});

document.getElementById("stats-add").addEventListener("click", () => {
  engine.addData();
  render();
});

document.getElementById("stats-sum").addEventListener("click", () => {
  engine.sum();
  render();
});

document.getElementById("stats-avg").addEventListener("click", () => {
  engine.average();
  render();
});

document.getElementById("stats-stddev").addEventListener("click", () => {
  engine.standardDeviation();
  render();
});

document.getElementById("stats-clear-data").addEventListener("click", () => {
  engine.clearData();
  render();
});

render();
