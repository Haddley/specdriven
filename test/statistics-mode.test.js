import { test } from "node:test";
import assert from "node:assert/strict";
import { CalculatorEngine } from "../calculator-logic.js";

test("Statistics mode is inactive by default with an empty data set", () => {
  const calc = new CalculatorEngine();
  assert.equal(calc.statisticsMode, false);
  assert.deepEqual(calc.dataSet, []);
});

test("toggling Statistics mode on then off leaves the data set empty", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  assert.deepEqual(calc.dataSet, []);
  calc.setStatisticsMode(false);
  assert.deepEqual(calc.dataSet, []);
});

test("entering Statistics mode starts with an empty data set", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  assert.equal(calc.dataSet.length, 0);
});

test("adding a value increases the data set and resets the display", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("5");
  calc.addToDataSet();
  assert.deepEqual(calc.dataSet, [5]);
  assert.equal(calc.display, "0");
});

test("adding several values accumulates them in order", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("2");
  calc.addToDataSet();
  calc.inputDigit("4");
  calc.addToDataSet();
  calc.inputDigit("6");
  calc.addToDataSet();
  assert.deepEqual(calc.dataSet, [2, 4, 6]);
});

test("addToDataSet is a no-op outside Statistics mode", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("5");
  calc.addToDataSet();
  assert.deepEqual(calc.dataSet, []);
});

test("computeSum shows the sum without modifying the data set", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  [2, 4, 6].forEach((value) => {
    calc.inputDigit(String(value));
    calc.addToDataSet();
  });
  calc.computeSum();
  assert.equal(calc.display, "12");
  assert.deepEqual(calc.dataSet, [2, 4, 6]);
});

test("computeSum with no data entered shows an error", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.computeSum();
  assert.equal(calc.display, "No data entered");
  assert.equal(calc.error, true);
});

test("computeAverage shows the arithmetic mean", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  [2, 4, 6].forEach((value) => {
    calc.inputDigit(String(value));
    calc.addToDataSet();
  });
  calc.computeAverage();
  assert.equal(calc.display, "4");
});

test("computeAverage with no data entered shows an error", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.computeAverage();
  assert.equal(calc.display, "No data entered");
  assert.equal(calc.error, true);
});

test("computeStdDev shows the population standard deviation", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  [2, 4, 6].forEach((value) => {
    calc.inputDigit(String(value));
    calc.addToDataSet();
  });
  calc.computeStdDev();
  assert.ok(
    Math.abs(parseFloat(calc.display) - 1.632993) < 1e-6,
    `expected ~1.632993, got ${calc.display}`
  );
});

test("computeStdDev of a single value is zero", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("7");
  calc.addToDataSet();
  calc.computeStdDev();
  assert.equal(calc.display, "0");
});

test("computing a result does not modify the data set", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  [2, 4, 6].forEach((value) => {
    calc.inputDigit(String(value));
    calc.addToDataSet();
  });
  calc.computeSum();
  assert.deepEqual(calc.dataSet, [2, 4, 6]);
  calc.computeAverage();
  assert.deepEqual(calc.dataSet, [2, 4, 6]);
  calc.computeStdDev();
  assert.deepEqual(calc.dataSet, [2, 4, 6]);
});

test("clear empties the data set while Statistics mode is active", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("2");
  calc.addToDataSet();
  calc.inputDigit("4");
  calc.addToDataSet();
  calc.clear();
  assert.deepEqual(calc.dataSet, []);
  assert.equal(calc.display, "0");
});

test("No data entered error blocks addToDataSet and digit entry until clear", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.computeSum();
  assert.equal(calc.display, "No data entered");
  assert.equal(calc.error, true);

  calc.inputDigit("5");
  assert.equal(calc.display, "No data entered", "digit entry is ignored while in error state");

  calc.addToDataSet();
  assert.deepEqual(calc.dataSet, [], "addToDataSet is ignored while in error state");

  calc.clear();
  assert.equal(calc.display, "0");
  assert.equal(calc.error, false);
});

test("leaving Statistics mode clears the data set", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("2");
  calc.addToDataSet();
  calc.inputDigit("4");
  calc.addToDataSet();
  calc.setStatisticsMode(false);
  assert.deepEqual(calc.dataSet, []);
});

test("re-entering Statistics mode starts empty again", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("2");
  calc.addToDataSet();
  calc.setStatisticsMode(false);
  calc.setStatisticsMode(true);
  assert.equal(calc.dataSet.length, 0);
});
