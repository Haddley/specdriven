import { test } from "node:test";
import assert from "node:assert/strict";
import { CalculatorEngine, formatNumber } from "../calculator-logic.js";

test("adds two numbers", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("5");
  calc.setOperator("+");
  calc.inputDigit("3");
  calc.equals();
  assert.equal(calc.display, "8");
});

test("subtracts two numbers", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("9");
  calc.setOperator("-");
  calc.inputDigit("4");
  calc.equals();
  assert.equal(calc.display, "5");
});

test("multiplies two numbers", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("6");
  calc.setOperator("×");
  calc.inputDigit("7");
  calc.equals();
  assert.equal(calc.display, "42");
});

test("divides two numbers", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("8");
  calc.setOperator("÷");
  calc.inputDigit("2");
  calc.equals();
  assert.equal(calc.display, "4");
});

test("division by zero shows an error and blocks further input until clear", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("5");
  calc.setOperator("÷");
  calc.inputDigit("0");
  calc.equals();
  assert.equal(calc.display, "Cannot divide by zero");
  assert.equal(calc.error, true);

  calc.inputDigit("1");
  assert.equal(calc.display, "Cannot divide by zero", "input is ignored while in error state");

  calc.clear();
  assert.equal(calc.display, "0");
  assert.equal(calc.error, false);
});

test("chains operators left-to-right, not by operator precedence", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("5");
  calc.setOperator("+");
  calc.inputDigit("3");
  calc.setOperator("×");
  calc.inputDigit("2");
  calc.equals();
  assert.equal(calc.display, "16", "(5 + 3) x 2, not 5 + (3 x 2)");
});

test("decimal input builds a fractional number", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("1");
  calc.inputDecimal();
  calc.inputDigit("5");
  assert.equal(calc.display, "1.5");
});

test("a second decimal point in the same entry is ignored", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("1");
  calc.inputDecimal();
  calc.inputDigit("5");
  calc.inputDecimal();
  calc.inputDigit("2");
  assert.equal(calc.display, "1.52");
});

test("starting a new number after an operator replaces the display rather than appending", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("1");
  calc.inputDigit("2");
  calc.setOperator("+");
  calc.inputDigit("3");
  assert.equal(calc.display, "3");
});

test("equals with no pending operator is a no-op", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("7");
  calc.equals();
  assert.equal(calc.display, "7");
});

test("formatNumber rounds away floating-point noise", () => {
  assert.equal(formatNumber(0.1 + 0.2), "0.3");
});

test("clear resets the engine to its initial state", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("9");
  calc.setOperator("+");
  calc.inputDigit("1");
  calc.clear();
  assert.equal(calc.display, "0");
  assert.equal(calc.previousValue, null);
  assert.equal(calc.operator, null);
});

// --- Programmer Mode ---

test("switching from Programmer to Standard mode clears entry and calculation", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("1");
  calc.setOperator("+");
  calc.setMode("standard");
  assert.equal(calc.display, "0");
  assert.equal(calc.previousValue, null);
  assert.equal(calc.operator, null);
  assert.equal(calc.mode, "standard");
});

test("setting mode to its current value is a no-op", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("7");
  calc.setMode("standard");
  assert.equal(calc.display, "7", "no reset should occur when mode is unchanged");
});

test("Programmer Mode Binary: valid digit entry displays correctly", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.inputDigit("1");
  calc.inputDigit("1");
  assert.equal(calc.display, "1011");
});

test("Programmer Mode Hexadecimal: valid digit entry displays correctly, normalized to uppercase", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(16);
  calc.inputDigit("2");
  calc.inputDigit("a");
  calc.inputDigit("F");
  assert.equal(calc.display, "2AF");
});

test("Programmer Mode Binary: invalid digit press has no effect", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("9");
  assert.equal(calc.display, "1");
});

test("Programmer Mode Octal: invalid digit press has no effect", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(8);
  calc.inputDigit("7");
  calc.inputDigit("8");
  assert.equal(calc.display, "7");
});

test("Programmer Mode Decimal: a letter press has no effect", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("5");
  calc.inputDigit("A");
  assert.equal(calc.display, "5");
});

test("the decimal-point key is a no-op in Programmer Mode, in every base", () => {
  for (const base of [10, 16, 8, 2]) {
    const calc = new CalculatorEngine();
    calc.setMode("programmer");
    calc.setBase(base);
    calc.inputDigit("1");
    calc.inputDecimal();
    assert.equal(calc.display, "1", `base ${base}`);
  }
});

test("Programmer Mode Hexadecimal: F + 1 = 10", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(16);
  calc.inputDigit("F");
  calc.setOperator("+");
  calc.inputDigit("1");
  calc.equals();
  assert.equal(calc.display, "10");
});

test("Programmer Mode Octal: 7 + 1 = 10", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(8);
  calc.inputDigit("7");
  calc.setOperator("+");
  calc.inputDigit("1");
  calc.equals();
  assert.equal(calc.display, "10");
});

test("Programmer Mode Binary: 11 x 10 = 110", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("1");
  calc.setOperator("×");
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.equals();
  assert.equal(calc.display, "110");
});

test("Programmer Mode: divide by zero shows the same error and blocks input until clear", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(16);
  calc.inputDigit("5");
  calc.setOperator("÷");
  calc.inputDigit("0");
  calc.equals();
  assert.equal(calc.display, "Cannot divide by zero");
  assert.equal(calc.error, true);

  calc.inputDigit("1");
  assert.equal(calc.display, "Cannot divide by zero", "input is ignored while in error state");

  calc.clear();
  assert.equal(calc.display, "0");
  assert.equal(calc.error, false);
});

test("Programmer Mode Decimal: a negative result displays as a leading minus sign", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("3");
  calc.setOperator("-");
  calc.inputDigit("5");
  calc.equals();
  assert.equal(calc.display, "-2");
});

test("switching base from Decimal to Hexadecimal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("2");
  calc.inputDigit("5");
  calc.inputDigit("5");
  calc.setBase(16);
  assert.equal(calc.display, "FF");
});

test("switching base from Binary to Octal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.setBase(8);
  assert.equal(calc.display, "12");
});

test("switching base with an operand entered and an operator pending converts the operand and preserves the operator", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("2");
  calc.inputDigit("5");
  calc.inputDigit("5");
  calc.setOperator("+");
  calc.setBase(16);
  assert.equal(calc.display, "FF");
  assert.equal(calc.operator, "+");
});

test("switching base while in an error state is a no-op until clear", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("5");
  calc.setOperator("÷");
  calc.inputDigit("0");
  calc.equals();
  assert.equal(calc.error, true);

  calc.setBase(16);
  assert.equal(calc.base, 10, "base switch should be ignored while in error state");
  assert.equal(calc.display, "Cannot divide by zero");

  calc.clear();
  calc.setBase(16);
  assert.equal(calc.base, 16);
});

test("Programmer Mode Binary: chains operators left-to-right, not by operator precedence", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.inputDigit("1");
  calc.setOperator("+");
  calc.inputDigit("1");
  calc.inputDigit("1");
  calc.setOperator("×");
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.equals();
  assert.equal(calc.display, "10000", "(101 + 11) x 10 = 10000, i.e. (5 + 3) x 2 = 16");
});

test("Programmer Mode Binary: inexact division truncates to an integer", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("1");
  calc.setOperator("÷");
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.equals();
  assert.equal(calc.display, "1", "11 (3) ÷ 10 (2) truncates to 1, not 1.5");
});

test("switching base from Hexadecimal to Octal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(16);
  calc.inputDigit("F");
  calc.inputDigit("F");
  calc.setBase(8);
  assert.equal(calc.display, "377");
});

test("switching base from Octal to Decimal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(8);
  calc.inputDigit("3");
  calc.inputDigit("7");
  calc.inputDigit("7");
  calc.setBase(10);
  assert.equal(calc.display, "255");
});

test("switching base from Decimal to Binary converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("2");
  calc.inputDigit("5");
  calc.inputDigit("5");
  calc.setBase(2);
  assert.equal(calc.display, "11111111");
});

test("switching base from Hexadecimal to Binary converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(16);
  calc.inputDigit("F");
  calc.inputDigit("F");
  calc.setBase(2);
  assert.equal(calc.display, "11111111");
});

test("switching base from Octal to Hexadecimal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(8);
  calc.inputDigit("3");
  calc.inputDigit("7");
  calc.inputDigit("7");
  calc.setBase(16);
  assert.equal(calc.display, "FF");
});

test("switching base from Binary to Decimal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(2);
  for (const bit of "11111111") calc.inputDigit(bit);
  calc.setBase(10);
  assert.equal(calc.display, "255");
});

test("switching base from Binary to Hexadecimal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(2);
  for (const bit of "11111111") calc.inputDigit(bit);
  calc.setBase(16);
  assert.equal(calc.display, "FF");
});

test("switching base from Decimal to Octal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("2");
  calc.inputDigit("5");
  calc.inputDigit("5");
  calc.setBase(8);
  assert.equal(calc.display, "377");
});

test("switching base from Hexadecimal to Decimal converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(16);
  calc.inputDigit("F");
  calc.inputDigit("F");
  calc.setBase(10);
  assert.equal(calc.display, "255");
});

test("switching base from Octal to Binary converts and redisplays the value", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(8);
  calc.inputDigit("3");
  calc.inputDigit("7");
  calc.inputDigit("7");
  calc.setBase(2);
  assert.equal(calc.display, "11111111");
});

test("Clear in Programmer Mode resets entry/calculation but leaves mode and base unchanged", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.setBase(16);
  calc.inputDigit("F");
  calc.setOperator("+");
  calc.clear();
  assert.equal(calc.display, "0");
  assert.equal(calc.previousValue, null);
  assert.equal(calc.operator, null);
  assert.equal(calc.mode, "programmer", "clear must not kick the user back to Standard Mode");
  assert.equal(calc.base, 16, "clear must not reset the selected base");
});

// --- Statistics Mode: Foundational ---

test("switching to Statistics Mode from Standard resets the data set and entry flag", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  assert.deepEqual(calc.dataSet, []);
  assert.equal(calc.dataEntryStarted, false);
});

test("switching to Statistics Mode from Programmer resets the data set and entry flag", () => {
  const calc = new CalculatorEngine();
  calc.setMode("programmer");
  calc.inputDigit("1");
  calc.setMode("statistics");
  assert.deepEqual(calc.dataSet, []);
  assert.equal(calc.dataEntryStarted, false);
});

test("switching from Statistics Mode back to Standard clears the data set and in-progress entry", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("5");
  calc.addDataPoint();
  calc.inputDigit("7");
  calc.setMode("standard");
  assert.deepEqual(calc.dataSet, [], "FR-013: data set clears on leaving Statistics Mode");
  assert.equal(calc.dataEntryStarted, false);
  assert.equal(calc.display, "0");
  assert.equal(calc.mode, "standard");
});

test("setOperator is a no-op in Statistics Mode", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("5");
  calc.setOperator("+");
  assert.equal(calc.operator, null);
  assert.equal(calc.previousValue, null);
});

test("equals is a no-op in Statistics Mode", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("5");
  calc.equals();
  assert.equal(calc.display, "5");
});

test("setting Statistics mode to its current value is a no-op and does not reset the data set", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("5");
  calc.addDataPoint();
  calc.setMode("statistics");
  assert.deepEqual(calc.dataSet, [5], "no reset should occur when mode is unchanged");
});

// --- Statistics Mode: User Story 1 (build a data set) ---

test("Statistics Mode starts with an empty data set", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  assert.equal(calc.dataSet.length, 0);
});

test("entering a number and adding it yields a data set of one point", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.addDataPoint();
  assert.deepEqual(calc.dataSet, [10]);
  assert.equal(calc.dataSet.length, 1);
});

test("adding successive numbers grows the data set count", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.addDataPoint();
  calc.inputDigit("2");
  calc.inputDigit("0");
  calc.addDataPoint();
  assert.equal(calc.dataSet.length, 2);
  calc.inputDigit("3");
  calc.inputDigit("0");
  calc.addDataPoint();
  assert.equal(calc.dataSet.length, 3);
});

test("a negative number, entered via toggleSign, is accepted into the data set", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("5");
  calc.toggleSign();
  assert.equal(calc.display, "-5");
  calc.addDataPoint();
  assert.deepEqual(calc.dataSet, [-5]);
});

test("a number with a decimal point is accepted into the data set", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("1");
  calc.inputDecimal();
  calc.inputDigit("5");
  calc.addDataPoint();
  assert.deepEqual(calc.dataSet, [1.5]);
});

test("pressing Add with no digits entered since the last add is a no-op", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("5");
  calc.addDataPoint();
  calc.addDataPoint();
  assert.deepEqual(calc.dataSet, [5], "a second Add without new entry must not add a 0");
});

test("adding the same numeric value twice yields two separate data points", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("5");
  calc.addDataPoint();
  calc.inputDigit("5");
  calc.addDataPoint();
  assert.deepEqual(calc.dataSet, [5, 5], "FR-012: duplicates are separate data points");
});

// --- Statistics Mode: User Story 2 (Sum and Average) ---

test("Sum and Average of a data set of 10, 20, 30", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  for (const n of ["10", "20", "30"]) {
    for (const d of n) calc.inputDigit(d);
    calc.addDataPoint();
  }
  calc.requestSum();
  assert.equal(calc.display, "60");
  calc.requestAverage();
  assert.equal(calc.display, "20");
});

test("Sum and Average of a single-point data set both equal that point", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("7");
  calc.addDataPoint();
  calc.requestSum();
  assert.equal(calc.display, "7");
  calc.requestAverage();
  assert.equal(calc.display, "7");
});

test("Sum and Average show 'No data' for an empty data set", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.requestSum();
  assert.equal(calc.display, "No data");
  calc.requestAverage();
  assert.equal(calc.display, "No data");
});

// --- Statistics Mode: User Story 3 (Standard Deviation) ---

test("Standard Deviation of {2,4,4,4,5,5,7,9} is the sample stddev, not the population stddev", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  for (const n of ["2", "4", "4", "4", "5", "5", "7", "9"]) {
    calc.inputDigit(n);
    calc.addDataPoint();
  }
  calc.requestStdDev();
  assert.equal(calc.display, "2.1380899353", "sample stddev (n-1), not population stddev (\"2\")");
});

test("Standard Deviation of a single-point data set is 'Undefined'", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("7");
  calc.addDataPoint();
  calc.requestStdDev();
  assert.equal(calc.display, "Undefined");
});

test("Standard Deviation of an empty data set is 'No data'", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.requestStdDev();
  assert.equal(calc.display, "No data");
});

// --- Statistics Mode: User Story 4 (manage the data set) ---

test("removing a data point by index leaves the others, and Sum reflects the change", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  for (const n of ["10", "20", "30"]) {
    for (const d of n) calc.inputDigit(d);
    calc.addDataPoint();
  }
  calc.removeDataPoint(1);
  assert.deepEqual(calc.dataSet, [10, 30]);
  calc.requestSum();
  assert.equal(calc.display, "40");
});

test("clearing a data set containing several points empties it", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  for (const n of ["10", "20", "30"]) {
    for (const d of n) calc.inputDigit(d);
    calc.addDataPoint();
  }
  calc.clearDataSet();
  assert.equal(calc.dataSet.length, 0);
});

test("clearing an already-empty data set is a no-op", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.clearDataSet();
  assert.deepEqual(calc.dataSet, []);
});

test("removing an out-of-range index is a no-op and does not error", () => {
  const calc = new CalculatorEngine();
  calc.setMode("statistics");
  calc.inputDigit("5");
  calc.addDataPoint();
  calc.removeDataPoint(5);
  assert.deepEqual(calc.dataSet, [5]);
  calc.removeDataPoint(-1);
  assert.deepEqual(calc.dataSet, [5]);
});
