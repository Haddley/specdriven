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

const RADIX_BY_BASE = {
  HEX: 16,
  OCT: 8,
  BIN: 2,
};

const VALID_DIGITS_BY_BASE = {
  DEC: "0123456789",
  HEX: "0123456789ABCDEF",
  OCT: "01234567",
  BIN: "01",
};

/** Digits the given base accepts as input. */
export function validDigitsForBase(base) {
  return VALID_DIGITS_BY_BASE[base];
}

/**
 * Renders a value as a signed 32-bit two's-complement string in the given
 * non-decimal base: uppercase hex digits, no radix prefix, no zero-padding
 * for positive values (negative values naturally fill all 32 bits since
 * their sign bit is set).
 */
export function toRadixString(value, base) {
  const unsigned = (value | 0) >>> 0;
  return unsigned.toString(RADIX_BY_BASE[base]).toUpperCase();
}

/**
 * A four-function calculator, modelled as a sequence of button presses.
 * Operations chain left-to-right as entered — e.g. 5 + 3 × 2 computes
 * (5 + 3) × 2 = 16, the way a plain (non-scientific) calculator works,
 * not by operator precedence.
 *
 * The active `base` (Decimal/Hex/Octal/Binary) determines how the display
 * is entered and rendered. Decimal keeps the existing float behavior;
 * Hex/Octal/Binary values are signed 32-bit two's-complement integers.
 */
export class CalculatorEngine {
  constructor() {
    this.base = "DEC";
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

  setBase(base) {
    const value = this._parseDisplayValue();
    this.base = base;
    if (this.error) return;
    this.display = this._formatValue(value);
  }

  inputDigit(digit) {
    if (this.error) return;
    if (!validDigitsForBase(this.base).includes(digit)) return;
    if (this.waitingForOperand) {
      this.display = digit;
      this.waitingForOperand = false;
    } else {
      this.display = this.display === "0" ? digit : this.display + digit;
    }
  }

  inputDecimal() {
    if (this.error) return;
    if (this.base !== "DEC") return;
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
    const inputValue = this._parseDisplayValue();

    if (this.previousValue === null) {
      this.previousValue = inputValue;
    } else if (!this.waitingForOperand) {
      const result = this._compute(this.previousValue, inputValue, this.operator);
      if (this.error) return;
      this.previousValue = result;
      this.display = this._formatValue(result);
    }

    this.waitingForOperand = true;
    this.operator = nextOperator;
  }

  equals() {
    if (this.error) return;
    if (this.operator === null || this.waitingForOperand) return;

    const inputValue = this._parseDisplayValue();
    const result = this._compute(this.previousValue, inputValue, this.operator);
    if (this.error) return;

    this.display = this._formatValue(result);
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = true;
  }

  /** Parses the display into the true numeric value, per the active base. */
  _parseDisplayValue() {
    if (this.base === "DEC") {
      return parseFloat(this.display);
    }
    return parseInt(this.display, RADIX_BY_BASE[this.base]) | 0;
  }

  /** Formats a true numeric value for display, per the active base. */
  _formatValue(value) {
    return this.base === "DEC" ? formatNumber(value) : toRadixString(value, this.base);
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
