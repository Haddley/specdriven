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

const VALID_DIGITS_BY_BASE = {
  2: "01",
  8: "01234567",
  10: "0123456789",
  16: "0123456789ABCDEF",
};

/**
 * Whether `digit` is a valid digit for `base` (case-insensitive for hex
 * letters), per the Programmer Mode digit-validity table.
 */
function isValidDigit(digit, base) {
  return VALID_DIGITS_BY_BASE[base].includes(digit.toUpperCase());
}

/**
 * Formats `value` as a string in `base`, uppercasing hex letters.
 * Negative numbers come out sign-magnitude for free (e.g. "-101" for -5
 * in base 2), via `Number.prototype.toString(radix)`.
 */
function formatInBase(value, base) {
  return value.toString(base).toUpperCase();
}

/**
 * A four-function calculator, modelled as a sequence of button presses.
 * Operations chain left-to-right as entered — e.g. 5 + 3 × 2 computes
 * (5 + 3) × 2 = 16, the way a plain (non-scientific) calculator works,
 * not by operator precedence.
 */
export class CalculatorEngine {
  constructor() {
    this.mode = "standard";
    this.base = 10;
    this.dataSet = [];
    this.dataEntryStarted = false;
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
    if (this.mode === "programmer" && !isValidDigit(digit, this.base)) return;
    const normalizedDigit = this.mode === "programmer" ? digit.toUpperCase() : digit;

    if (this.waitingForOperand) {
      this.display = normalizedDigit;
      this.waitingForOperand = false;
    } else {
      this.display = this.display === "0" ? normalizedDigit : this.display + normalizedDigit;
    }

    if (this.mode === "statistics") {
      this.dataEntryStarted = true;
    }
  }

  inputDecimal() {
    if (this.error) return;
    if (this.mode === "programmer") return;
    if (this.waitingForOperand) {
      this.display = "0.";
      this.waitingForOperand = false;
      if (this.mode === "statistics") {
        this.dataEntryStarted = true;
      }
      return;
    }
    if (!this.display.includes(".")) {
      this.display += ".";
      if (this.mode === "statistics") {
        this.dataEntryStarted = true;
      }
    }
  }

  toggleSign() {
    if (this.error) return;
    if (this.mode !== "statistics") return;
    if (this.display === "0") return;
    this.display = this.display.startsWith("-") ? this.display.slice(1) : "-" + this.display;
  }

  addDataPoint() {
    if (this.error) return;
    if (this.mode !== "statistics") return;
    if (!this.dataEntryStarted) return;
    this.dataSet.push(parseFloat(this.display));
    this.display = "0";
    this.waitingForOperand = true;
    this.dataEntryStarted = false;
  }

  removeDataPoint(index) {
    if (this.mode !== "statistics") return;
    if (index < 0 || index >= this.dataSet.length) return;
    this.dataSet.splice(index, 1);
  }

  clearDataSet() {
    if (this.mode !== "statistics") return;
    this.dataSet = [];
  }

  requestSum() {
    if (this.mode !== "statistics") return;
    if (this.dataSet.length === 0) {
      this.display = "No data";
    } else {
      this.display = formatNumber(this.dataSet.reduce((a, b) => a + b, 0));
    }
    this.waitingForOperand = true;
    this.dataEntryStarted = false;
  }

  requestAverage() {
    if (this.mode !== "statistics") return;
    if (this.dataSet.length === 0) {
      this.display = "No data";
    } else {
      const sum = this.dataSet.reduce((a, b) => a + b, 0);
      this.display = formatNumber(sum / this.dataSet.length);
    }
    this.waitingForOperand = true;
    this.dataEntryStarted = false;
  }

  requestStdDev() {
    if (this.mode !== "statistics") return;
    if (this.dataSet.length === 0) {
      this.display = "No data";
    } else if (this.dataSet.length === 1) {
      this.display = "Undefined";
    } else {
      const n = this.dataSet.length;
      const mean = this.dataSet.reduce((a, b) => a + b, 0) / n;
      const variance = this.dataSet.reduce((acc, x) => acc + (x - mean) ** 2, 0) / (n - 1);
      this.display = formatNumber(Math.sqrt(variance));
    }
    this.waitingForOperand = true;
    this.dataEntryStarted = false;
  }

  setOperator(nextOperator) {
    if (this.error) return;
    if (this.mode === "statistics") return;
    const inputValue =
      this.mode === "programmer" ? parseInt(this.display, this.base) : parseFloat(this.display);

    if (this.previousValue === null) {
      this.previousValue = inputValue;
    } else if (!this.waitingForOperand) {
      const result = this._compute(this.previousValue, inputValue, this.operator);
      if (this.error) return;
      this.previousValue = result;
      this.display = this.mode === "programmer" ? formatInBase(result, this.base) : formatNumber(result);
    }

    this.waitingForOperand = true;
    this.operator = nextOperator;
  }

  equals() {
    if (this.error) return;
    if (this.mode === "statistics") return;
    if (this.operator === null || this.waitingForOperand) return;

    const inputValue =
      this.mode === "programmer" ? parseInt(this.display, this.base) : parseFloat(this.display);
    const result = this._compute(this.previousValue, inputValue, this.operator);
    if (this.error) return;

    this.display = this.mode === "programmer" ? formatInBase(result, this.base) : formatNumber(result);
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = true;
  }

  setMode(newMode) {
    if (newMode === this.mode) return;
    this.mode = newMode;
    this.base = 10;
    this.dataSet = [];
    this.dataEntryStarted = false;
    this.reset();
  }

  setBase(newBase) {
    if (this.error) return;
    if (newBase === this.base) return;
    const currentValue = parseInt(this.display, this.base);
    this.base = newBase;
    this.display = formatInBase(currentValue, newBase);
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
        return this.mode === "programmer" ? Math.trunc(a / b) : a / b;
      default:
        return b;
    }
  }
}
