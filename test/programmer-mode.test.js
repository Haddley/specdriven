import { test } from "node:test";
import assert from "node:assert/strict";
import { CalculatorEngine, toRadixString, validDigitsForBase } from "../calculator-logic.js";

test("a new engine starts in Decimal mode", () => {
  const calc = new CalculatorEngine();
  assert.equal(calc.base, "DEC");
});

test("setBase updates the active base", () => {
  const calc = new CalculatorEngine();
  calc.setBase("HEX");
  assert.equal(calc.base, "HEX");
});

test("toRadixString renders positive values per base", () => {
  assert.equal(toRadixString(255, "HEX"), "FF");
  assert.equal(toRadixString(8, "BIN"), "1000");
  assert.equal(toRadixString(8, "OCT"), "10");
});

test("toRadixString renders negative values as a 32-bit two's-complement pattern", () => {
  assert.equal(toRadixString(-1, "HEX"), "FFFFFFFF");
  assert.equal(toRadixString(-1, "BIN"), "1".repeat(32));
});

test("switching from Decimal to Hexadecimal reformats the display", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("2");
  calc.inputDigit("5");
  calc.inputDigit("5");
  calc.setBase("HEX");
  assert.equal(calc.display, "FF");
});

test("switching from Hexadecimal to Binary reformats the display", () => {
  const calc = new CalculatorEngine();
  calc.setBase("HEX");
  calc.inputDigit("F");
  calc.inputDigit("F");
  calc.setBase("BIN");
  assert.equal(calc.display, "11111111");
});

test("leaving Decimal truncates a fractional value toward zero", () => {
  const calc = new CalculatorEngine();
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.inputDecimal();
  calc.inputDigit("7");
  calc.inputDigit("5");
  calc.setBase("HEX");
  assert.equal(calc.display, "A");
});

test("arithmetic overflow wraps using 32-bit two's-complement semantics", () => {
  const calc = new CalculatorEngine();
  calc.setBase("HEX");
  "7FFFFFFF".split("").forEach((digit) => calc.inputDigit(digit));
  calc.setOperator("+");
  calc.inputDigit("1");
  calc.equals();
  assert.equal(calc.display, "80000000");
});

test("inputDigit is a no-op for digits invalid in the active base", () => {
  const calc = new CalculatorEngine();
  calc.setBase("BIN");
  calc.inputDigit("5");
  assert.equal(calc.display, "0");
});

test("inputDigit accepts hex digits in Hexadecimal mode but rejects them in Decimal mode", () => {
  const hex = new CalculatorEngine();
  hex.setBase("HEX");
  hex.inputDigit("A");
  assert.equal(hex.display, "A");

  const dec = new CalculatorEngine();
  dec.inputDigit("A");
  assert.equal(dec.display, "0");
});

test("Octal mode accepts 0-7 but rejects 8, 9, and hex letters", () => {
  const calc = new CalculatorEngine();
  calc.setBase("OCT");
  calc.inputDigit("7");
  assert.equal(calc.display, "7");
  calc.inputDigit("8");
  assert.equal(calc.display, "7", "8 is not a valid octal digit");
  calc.inputDigit("9");
  assert.equal(calc.display, "7", "9 is not a valid octal digit");
  calc.inputDigit("A");
  assert.equal(calc.display, "7", "A is not a valid octal digit");
});

test("Hexadecimal mode accepts every digit 0-9 and A-F", () => {
  const calc = new CalculatorEngine();
  calc.setBase("HEX");
  assert.equal(validDigitsForBase("HEX"), "0123456789ABCDEF");
  "0123456789ABCDEF".split("").forEach((digit) => {
    const fresh = new CalculatorEngine();
    fresh.setBase("HEX");
    fresh.inputDigit(digit);
    assert.equal(fresh.display, digit);
  });
});

test("inputDecimal does not modify the display outside Decimal mode", () => {
  for (const base of ["BIN", "OCT", "HEX"]) {
    const calc = new CalculatorEngine();
    calc.setBase(base);
    calc.inputDigit("1");
    calc.inputDecimal();
    assert.equal(calc.display, "1", `inputDecimal should be a no-op in ${base} mode`);
  }
});

test("addition in Binary", () => {
  const calc = new CalculatorEngine();
  calc.setBase("BIN");
  calc.inputDigit("1");
  calc.inputDigit("0");
  calc.inputDigit("1");
  calc.setOperator("+");
  calc.inputDigit("1");
  calc.inputDigit("1");
  calc.equals();
  assert.equal(calc.display, "1000");
});

test("multiplication in Hexadecimal", () => {
  const calc = new CalculatorEngine();
  calc.setBase("HEX");
  calc.inputDigit("A");
  calc.setOperator("×");
  calc.inputDigit("2");
  calc.equals();
  assert.equal(calc.display, "14");
});

test("dividing by zero in a non-decimal base still errors and blocks input until clear", () => {
  const calc = new CalculatorEngine();
  calc.setBase("BIN");
  calc.inputDigit("1");
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

test("hexadecimal values display uppercase with no radix prefix", () => {
  const calc = new CalculatorEngine();
  calc.setBase("HEX");
  calc.inputDigit("A");
  assert.equal(calc.display, "A");
  assert.notEqual(calc.display, "a");
  assert.notEqual(calc.display, "0xA");
});
