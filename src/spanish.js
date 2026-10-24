// Logika: konwersja liczb 1-999 na hiszpański, przedziały, losowanie.

const ones = [
  "cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho",
  "nueve", "diez", "once", "doce", "trece", "catorce", "quince",
  "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte",
];
const tensWords = {
  20: "veinte", 30: "treinta", 40: "cuarenta", 50: "cincuenta",
  60: "sesenta", 70: "setenta", 80: "ochenta", 90: "noventa",
};
const hundreds = {
  100: "cien", 200: "doscientos", 300: "trescientos", 400: "cuatrocientos",
  500: "quinientos", 600: "seiscientos", 700: "setecientos",
  800: "ochocientos", 900: "novecientos",
};

export function numberToSpanish(n) {
  if (n <= 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10) * 10;
    const r = n % 10;
    if (r === 0) return tensWords[t];
    if (t === 20) return "veinti" + ones[r];
    return tensWords[t] + " y " + ones[r];
  }
  if (n === 100) return "cien";
  if (n < 1000) {
    const h = Math.floor(n / 100) * 100;
    const r = n % 100;
    const hw = h === 100 ? "ciento" : hundreds[h];
    return r === 0 ? hundreds[h] : hw + " " + numberToSpanish(r);
  }
  return String(n);
}

export function normalize(s) {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

// Przedziały: 1-100, 101-200, ..., 901-999
export const RANGES = [];
for (let start = 1; start <= 999; start += 100) {
  RANGES.push({ start, end: Math.min(start + 99, 999) });
}

export function rangeIndex(n) {
  return Math.min(Math.floor((n - 1) / 100), RANGES.length - 1);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickNumber(activeRanges) {
  let candidates = RANGES.filter((_, i) => activeRanges[i]);
  if (candidates.length === 0) candidates = RANGES; // nic nie zaznaczono -> pełny zakres
  const r = candidates[Math.floor(Math.random() * candidates.length)];
  return randomInt(r.start, r.end);
}
