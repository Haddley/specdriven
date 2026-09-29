// Pure calculation engine for the calculator — no DOM access here, so it can
// be tested directly and reused unchanged by calculator.js in the browser.

/**
 * Formats a numeric result for display: rounds away floating-point noise
 * (e.g. 0.1 + 0.2) and drops a trailing ".0" where possible.
 */
export function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return rounded.toString();
}

/**
 * A four-function calculator, modelled as a sequence of button presses.
 * Operations chain left-to-right as entered — e.g. 5 + 3 × 2 computes
 * (5 + 3) × 2 = 16, the way a plain (non-scientific) calculator works,
 * not by operator precedence.
 */
export class CalculatorEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.display = "0";
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = false;
    this.error = false;
  }

  clear() {
    this.reset();
  }

  inputDigit(digit) {
    if (this.error) return;
    if (this.waitingForOperand) {
      this.display = digit;
      this.waitingForOperand = false;
    } else {
      this.display = this.display === "0" ? digit : this.display + digit;
    }
  }

  inputDecimal() {
    if (this.error) return;
    if (this.waitingForOperand) {
      this.display = "0.";
      this.waitingForOperand = false;
      return;
    }
    if (!this.display.includes(".")) {
      this.display += ".";
    }
  }

  setOperator(nextOperator) {
    if (this.error) return;
    const inputValue = parseFloat(this.display);

    if (this.previousValue === null) {
      this.previousValue = inputValue;
    } else if (!this.waitingForOperand) {
      const result = this._compute(this.previousValue, inputValue, this.operator);
      if (this.error) return;
      this.previousValue = result;
      this.display = formatNumber(result);
    }

    this.waitingForOperand = true;
    this.operator = nextOperator;
  }

  equals() {
    if (this.error) return;
    if (this.operator === null || this.waitingForOperand) return;

    const inputValue = parseFloat(this.display);
    const result = this._compute(this.previousValue, inputValue, this.operator);
    if (this.error) return;

    this.display = formatNumber(result);
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = true;
  }

  _compute(a, b, operator) {
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "×":
        return a * b;
      case "÷":
        if (b === 0) {
          this.display = "Cannot divide by zero";
          this.error = true;
          this.previousValue = null;
          this.operator = null;
          return null;
        }
        return a / b;
      default:
        return b;
    }
  }
}
