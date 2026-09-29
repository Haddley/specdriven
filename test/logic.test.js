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
