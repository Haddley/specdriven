import { test } from "node:test";
import assert from "node:assert/strict";
import { CalculatorEngine, formatNumber, isValidDigitForBase } from "../calculator-logic.js";

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

// --- Programmer Mode (Binary/Octal/Hex) ---

test("Programmer Mode: hex digit entry builds an uppercase hex string", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.setBase(16);
  calc.inputDigit("A");
  calc.inputDigit("5");
  assert.equal(calc.display, "A5");
});

test("Programmer Mode: digits invalid for the active base are ignored", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("9"); // not a valid binary digit
  calc.inputDigit("2"); // not a valid binary digit
  calc.inputDigit("0");
  assert.equal(calc.display, "10");
});

test("Programmer Mode: binary arithmetic (5 + 3 = 8)", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.inputDigit("1"); // "101" = 5
  calc.setOperator("+");
  calc.inputDigit("1");
  calc.inputDigit("1"); // "11" = 3
  calc.equals();
  assert.equal(calc.display, "1000"); // 8 in binary
});

test("Programmer Mode: switching base converts and redisplays the current value", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.inputDigit("2");
  calc.inputDigit("5");
  calc.inputDigit("5"); // display "255" in DEC
  calc.setBase(16);
  assert.equal(calc.display, "FF");
});

test("Programmer Mode: switching base does not disturb a pending operator", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.setOperator("+");
  calc.setBase(16);
  assert.equal(calc.display, "A");
  assert.equal(calc.operator, "+");
  assert.equal(calc.previousValue, 10);
});

test("Programmer Mode: decimal point is ignored while active", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.inputDigit("5");
  calc.inputDecimal();
  assert.equal(calc.display, "5");
});

test("Programmer Mode: divide by zero in a non-decimal base still errors and blocks input", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.setBase(8);
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

test("Programmer Mode: negative results show as sign + magnitude, not two's complement", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.setBase(2);
  calc.inputDigit("1");
  calc.inputDigit("1"); // "11" = 3
  calc.setOperator("-");
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.inputDigit("1"); // "101" = 5
  calc.equals();
  assert.equal(calc.display, "-10"); // 3 - 5 = -2, magnitude 2 in binary
});

test("Programmer Mode: activating preserves the current value and defaults to DEC", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("4");
  calc.inputDigit("2");
  calc.setProgrammerMode(true);
  assert.equal(calc.display, "42");
  assert.equal(calc.base, 10);
});

test("Programmer Mode: activating truncates an existing fractional value (integer-only, even in DEC)", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("3");
  calc.inputDecimal();
  calc.inputDigit("1");
  calc.inputDigit("4"); // "3.14" in Standard mode
  calc.setProgrammerMode(true);
  assert.equal(calc.display, "3");
});

test("isValidDigitForBase rejects multi-character and empty strings", () => {
  assert.equal(isValidDigitForBase("AB", 16), false, "substring match must not count as a valid single digit");
  assert.equal(isValidDigitForBase("", 16), false, "empty string must not count as a valid digit");
  assert.equal(isValidDigitForBase("A", 16), true, "a genuine single hex digit is still valid");
});

test("Programmer Mode: deactivating restores decimal input and the full digit set", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.setBase(16);
  calc.inputDigit("F");
  calc.inputDigit("F"); // "FF" = 255
  calc.setProgrammerMode(false);
  assert.equal(calc.display, "255");
  assert.equal(calc.base, 10);

  calc.clear();
  calc.inputDigit("1");
  calc.inputDecimal();
  calc.inputDigit("5");
  assert.equal(calc.display, "1.5", "decimal point works again in Standard mode");
});

// --- Statistics Mode (Sum, Average, Standard Deviation) ---

test("Statistics Mode: Add appends the display value to the data list and resets the display", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("4");
  calc.addData();
  assert.deepEqual(calc.data, [4]);
  assert.equal(calc.display, "0");

  calc.inputDigit("8");
  calc.addData();
  calc.inputDigit("6");
  calc.addData();
  assert.deepEqual(calc.data, [4, 8, 6]);
  assert.equal(calc.display, "0");
});

test("Statistics Mode: Sum computes over the data list and leaves it unchanged", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  [4, 8, 6].forEach((n) => {
    calc.inputDigit(String(n));
    calc.addData();
  });
  calc.sum();
  assert.equal(calc.display, "18");
  assert.deepEqual(calc.data, [4, 8, 6], "the data list is unchanged");

  // Repeatable, like equals().
  calc.sum();
  assert.equal(calc.display, "18");
});

test("Statistics Mode: Add no-ops right after Sum/Average/Std Dev, until new digits are entered", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("4");
  calc.addData();
  calc.inputDigit("8");
  calc.addData();
  calc.sum();
  assert.equal(calc.display, "12");

  calc.addData(); // pressed again with no fresh digit entry in between
  assert.deepEqual(calc.data, [4, 8], "the computed sum is not silently re-added as a data point");
  assert.equal(calc.display, "12", "the display is unaffected by the no-op");
});

test("Statistics Mode: Average computes over the data list and leaves it unchanged", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  [4, 8, 6].forEach((n) => {
    calc.inputDigit(String(n));
    calc.addData();
  });
  calc.average();
  assert.equal(calc.display, "6");
  assert.deepEqual(calc.data, [4, 8, 6], "the data list is unchanged");
});

test("Statistics Mode: Std Dev computes the sample standard deviation and leaves the data unchanged", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  [4, 8, 6].forEach((n) => {
    calc.inputDigit(String(n));
    calc.addData();
  });
  calc.standardDeviation();
  // mean = 6, variance = ((4-6)^2 + (8-6)^2 + (6-6)^2) / (3-1) = 8/2 = 4, sqrt = 2
  assert.equal(calc.display, "2");
  assert.deepEqual(calc.data, [4, 8, 6], "the data list is unchanged");
});

test("Statistics Mode: Sum with no data displays 0", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.sum();
  assert.equal(calc.display, "0");
});

test("Statistics Mode: Average with no data errors and blocks input until Clear", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.average();
  assert.equal(calc.display, "No data entered");
  assert.equal(calc.error, true);

  calc.inputDigit("1");
  assert.equal(calc.display, "No data entered", "input is ignored while in error state");

  calc.clear();
  assert.equal(calc.display, "0");
  assert.equal(calc.error, false);
  assert.deepEqual(calc.data, [], "no data had been entered");
});

test("Statistics Mode: Std Dev with fewer than 2 points errors and blocks input until Clear", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("5");
  calc.addData();
  calc.standardDeviation();
  assert.equal(calc.display, "Not enough data");
  assert.equal(calc.error, true);

  calc.inputDigit("1");
  assert.equal(calc.display, "Not enough data", "input is ignored while in error state");

  calc.clear();
  assert.equal(calc.display, "0");
  assert.equal(calc.error, false);
  assert.deepEqual(calc.data, [5], "the data list survives Clear, since only Clear Data empties it");
});

test("Statistics Mode: Clear Data empties the list independently of the display", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  [4, 8, 6].forEach((n) => {
    calc.inputDigit(String(n));
    calc.addData();
  });
  calc.sum();
  assert.equal(calc.display, "18");

  calc.clearData();
  assert.deepEqual(calc.data, []);
  assert.equal(calc.display, "18", "the display is unaffected by Clear Data");
});

test("Statistics Mode: the data list persists across Clear (C) and across toggling the mode off and on", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("7");
  calc.addData();

  calc.clear();
  assert.deepEqual(calc.data, [7], "Clear (C) does not empty the data list");

  calc.setStatisticsMode(false);
  calc.setStatisticsMode(true);
  assert.deepEqual(calc.data, [7], "toggling the mode off and on does not empty the data list");
});

test("Statistics Mode: activating turns off Programmer Mode and reverts the base to DEC", () => {
  const calc = new CalculatorEngine();
  calc.setProgrammerMode(true);
  calc.setBase(16);
  calc.inputDigit("A");
  calc.setStatisticsMode(true);
  assert.equal(calc.programmerMode, false);
  assert.equal(calc.base, 10);
  assert.equal(calc.statisticsMode, true);
});

test("Statistics Mode: activating Programmer Mode turns off Statistics Mode", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("9");
  calc.addData();
  calc.setProgrammerMode(true);
  assert.equal(calc.statisticsMode, false);
  assert.equal(calc.programmerMode, true);
  assert.deepEqual(calc.data, [9], "data is retained even though the mode is off");
});

test("Statistics Mode: digit entry after computing a statistic starts a fresh number", () => {
  const calc = new CalculatorEngine();
  calc.setStatisticsMode(true);
  calc.inputDigit("4");
  calc.addData();
  calc.inputDigit("8");
  calc.addData();
  calc.average();
  assert.equal(calc.display, "6");

  calc.inputDigit("3");
  assert.equal(calc.display, "3", "digit entry replaces rather than appends after Average");
});
