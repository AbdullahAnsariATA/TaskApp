import {
  formatCardNumber,
  formatExpiryDate,
  validateSSN,
  formatSSN,
  convertToArabicNumerals,
} from '../../src/utils/validations';

describe('formatCardNumber', () => {
  it('formats 16 digits into groups of 4', () => {
    expect(formatCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
  });

  it('handles already formatted input', () => {
    expect(formatCardNumber('1234 5678 9012 3456')).toBe('1234 5678 9012 3456');
  });

  it('handles partial input', () => {
    expect(formatCardNumber('123456')).toBe('1234 56');
  });

  it('handles empty string', () => {
    expect(formatCardNumber('')).toBe('');
  });
});

describe('formatExpiryDate', () => {
  it('formats MMYY into MM/YY', () => {
    expect(formatExpiryDate('1225')).toBe('12/25');
  });

  it('handles partial month', () => {
    expect(formatExpiryDate('0')).toBe('0');
  });

  it('strips non-digit characters', () => {
    expect(formatExpiryDate('12/25')).toBe('12/25');
  });

  it('handles empty string', () => {
    expect(formatExpiryDate('')).toBe('');
  });
});

describe('validateSSN', () => {
  it('accepts a valid SSN', () => {
    expect(validateSSN('123456789')).toBe(true);
  });

  it('accepts SSN with hyphens', () => {
    expect(validateSSN('123-45-6789')).toBe(true);
  });

  it('accepts SSN with spaces', () => {
    expect(validateSSN('123 45 6789')).toBe(true);
  });

  it('rejects undefined', () => {
    expect(validateSSN(undefined)).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateSSN('')).toBe(false);
  });

  it('rejects SSN starting with 000', () => {
    expect(validateSSN('000456789')).toBe(false);
  });

  it('rejects SSN starting with 666', () => {
    expect(validateSSN('666456789')).toBe(false);
  });

  it('rejects SSN starting with 900-999', () => {
    expect(validateSSN('900456789')).toBe(false);
    expect(validateSSN('999456789')).toBe(false);
  });

  it('rejects SSN with middle group 00', () => {
    expect(validateSSN('123006789')).toBe(false);
  });

  it('rejects SSN with last group 0000', () => {
    expect(validateSSN('123450000')).toBe(false);
  });

  it('rejects non-numeric SSN', () => {
    expect(validateSSN('12345678a')).toBe(false);
  });

  it('rejects SSN with wrong length', () => {
    expect(validateSSN('12345678')).toBe(false);
    expect(validateSSN('1234567890')).toBe(false);
  });
});

describe('formatSSN', () => {
  it('formats 9 digits as XXX-XX-XXXX', () => {
    expect(formatSSN('123456789')).toBe('123-45-6789');
  });

  it('handles partial input (3 digits)', () => {
    expect(formatSSN('123')).toBe('123');
  });

  it('handles partial input (5 digits)', () => {
    expect(formatSSN('12345')).toBe('123-45');
  });

  it('strips existing hyphens and reformats', () => {
    expect(formatSSN('123-45-6789')).toBe('123-45-6789');
  });

  it('returns empty string for empty input', () => {
    expect(formatSSN('')).toBe('');
  });

  it('returns empty string for undefined-like input', () => {
    expect(formatSSN(undefined as any)).toBe('');
  });
});

describe('convertToArabicNumerals', () => {
  it('converts western digits to Arabic-Indic numerals', () => {
    expect(convertToArabicNumerals('0123456789')).toBe('٠١٢٣٤٥٦٧٨٩');
  });

  it('leaves non-digit characters unchanged', () => {
    expect(convertToArabicNumerals('abc')).toBe('abc');
  });

  it('converts digits in mixed strings', () => {
    expect(convertToArabicNumerals('Age: 25')).toBe('Age: ٢٥');
  });

  it('handles empty string', () => {
    expect(convertToArabicNumerals('')).toBe('');
  });
});
