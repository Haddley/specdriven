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
