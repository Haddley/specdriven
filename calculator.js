import { CalculatorEngine } from "./calculator-logic.js";

const engine = new CalculatorEngine();
const displayEl = document.getElementById("display");
const baseSelectorEl = document.getElementById("base-selector");
const hexKeysEl = document.getElementById("hex-keys");
const statsPanelEl = document.getElementById("stats-panel");
const statsCountEl = document.getElementById("stats-count");
const statsListEl = document.getElementById("stats-list");

function render() {
  displayEl.textContent = engine.display;
  baseSelectorEl.hidden = engine.mode !== "programmer";
  hexKeysEl.hidden = !(engine.mode === "programmer" && engine.base === 16);

  statsPanelEl.hidden = engine.mode !== "statistics";
  statsCountEl.textContent = `${engine.dataSet.length} data point${engine.dataSet.length === 1 ? "" : "s"}`;
  statsListEl.innerHTML = "";
  engine.dataSet.forEach((value, index) => {
    const item = document.createElement("li");
    item.textContent = value;
    const removeButton = document.createElement("button");
    removeButton.textContent = "×";
    removeButton.addEventListener("click", () => {
      engine.removeDataPoint(index);
      render();
    });
    item.appendChild(removeButton);
    statsListEl.appendChild(item);
  });
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

document.getElementById("toggle-sign").addEventListener("click", () => {
  engine.toggleSign();
  render();
});

document.getElementById("add-data-point").addEventListener("click", () => {
  engine.addDataPoint();
  render();
});

document.getElementById("request-sum").addEventListener("click", () => {
  engine.requestSum();
  render();
});

document.getElementById("request-average").addEventListener("click", () => {
  engine.requestAverage();
  render();
});

document.getElementById("request-stddev").addEventListener("click", () => {
  engine.requestStdDev();
  render();
});

document.getElementById("clear-data-set").addEventListener("click", () => {
  engine.clearDataSet();
  render();
});

render();
