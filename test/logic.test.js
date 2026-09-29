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
