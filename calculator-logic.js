// Pure calculation engine for the calculator — no DOM access here, so it can
// be tested directly and reused unchanged by calculator.js in the browser.

// Valid entry digits per supported base, used both to validate digit entry
// and to let calculator.js decide which digit buttons to enable/disable.
const BASE_DIGITS = {
  2: "01",
  8: "01234567",
  10: "0123456789",
  16: "0123456789ABCDEF",
};

/** Programmer Mode's supported bases, keyed by their display label. */
export const BASES = { DEC: 10, HEX: 16, OCT: 8, BIN: 2 };

/**
 * Returns true if `digit` is a legal entry character for `base` (e.g. "A" is
 * valid for base 16 but not base 10 or base 8).
 */
export function isValidDigitForBase(digit, base) {
  const valid = BASE_DIGITS[base];
  const upper = String(digit).toUpperCase();
  return Boolean(valid) && upper.length === 1 && valid.includes(upper);
}

/**
 * Formats a numeric result for display.
 *
 * base 10 (default): rounds away floating-point noise (e.g. 0.1 + 0.2) and
 * drops a trailing ".0" where possible — unchanged from Standard mode's
 * original behavior.
 *
 * Other bases (Programmer Mode): Programmer Mode is integer-only, so the
 * value is truncated to an integer, then its magnitude is rendered in the
 * target base and uppercased (so hex reads "FF", not "ff"); negative values
 * are shown as sign + magnitude (e.g. "-10" for -2 in binary), not two's
 * complement.
 */
export function formatNumber(value, base = 10) {
  if (!Number.isFinite(value)) {
    return "Error";
  }
  if (base === 10) {
    const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
    return rounded.toString();
  }
  const truncated = Math.trunc(value);
  const magnitude = Math.abs(truncated).toString(base).toUpperCase();
  return truncated < 0 ? `-${magnitude}` : magnitude;
}

/**
 * A four-function calculator, modelled as a sequence of button presses.
 * Operations chain left-to-right as entered — e.g. 5 + 3 × 2 computes
 * (5 + 3) × 2 = 16, the way a plain (non-scientific) calculator works,
 * not by operator precedence.
 */
export class CalculatorEngine {
  constructor() {
    // Programmer Mode state persists across clear() (Clear doesn't change
    // the active mode or base), so it's set up once here, outside reset().
    this.base = BASES.DEC;
    this.programmerMode = false;
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

  /**
   * Turns Programmer Mode on/off. Activating truncates the current value
   * to an integer (Programmer Mode is integer-only, even in its default
   * DEC base) and redisplays it. Deactivating converts the display back
   * to decimal if a non-decimal base was active, so Standard mode always
   * shows and accepts base-10 input.
   */
  setProgrammerMode(active) {
    if (this.error) return;
    this.programmerMode = active;
    if (active) {
      this.display = formatNumber(Math.trunc(this._parseValue(this.display)), this.base);
    } else if (this.base !== BASES.DEC) {
      this.setBase(BASES.DEC);
    }
  }

  /**
   * Switches the active base, converting and redisplaying the current
   * value without disturbing a pending operator or previousValue (those
   * are tracked internally as plain decimal numbers, independent of base).
   */
  setBase(nextBase) {
    if (this.error) return;
    if (!BASE_DIGITS[nextBase] || nextBase === this.base) return;
    const currentValue = this._parseValue(this.display);
    this.base = nextBase;
    this.display = formatNumber(currentValue, this.base);
  }

  inputDigit(digit) {
    if (this.error) return;
    if (!isValidDigitForBase(digit, this.base)) return;
    if (this.waitingForOperand) {
      this.display = digit;
      this.waitingForOperand = false;
    } else {
      this.display = this.display === "0" ? digit : this.display + digit;
    }
  }

  inputDecimal() {
    if (this.error) return;
    // Programmer Mode is integer-only: the decimal point is disabled while
    // active, in every base (matches Windows Calculator).
    if (this.programmerMode) return;
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
    const inputValue = this._parseValue(this.display);

    if (this.previousValue === null) {
      this.previousValue = inputValue;
    } else if (!this.waitingForOperand) {
      const result = this._compute(this.previousValue, inputValue, this.operator);
      if (this.error) return;
      this.previousValue = result;
      this.display = formatNumber(result, this.base);
    }

    this.waitingForOperand = true;
    this.operator = nextOperator;
  }

  equals() {
    if (this.error) return;
    if (this.operator === null || this.waitingForOperand) return;

    const inputValue = this._parseValue(this.display);
    const result = this._compute(this.previousValue, inputValue, this.operator);
    if (this.error) return;

    this.display = formatNumber(result, this.base);
    this.previousValue = null;
    this.operator = null;
    this.waitingForOperand = true;
  }

  /** Parses the display string in the active base (decimals only apply to base 10). */
  _parseValue(str) {
    return this.base === BASES.DEC ? parseFloat(str) : parseInt(str, this.base);
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
