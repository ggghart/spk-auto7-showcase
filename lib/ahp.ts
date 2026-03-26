// lib/ahp.ts

// Nilai Random Index (RI) bawaan rumus AHP (ukuran matriks 1 sampai 10)
const RI = [0, 0, 0.58, 0.90, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];

// Fungsinya sekarang nerima parameter 'matrix' yang isinya dinamis
export function calculateAHP(matrix: number[][]) {
  const n = matrix.length;

  // Kalau matriks kosong, langsung return error biar ga crash
  if (n === 0) return null;

  // Step 1: Hitung jumlah setiap kolom
  const colSums = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      colSums[j] += matrix[i][j];
    }
  }

  // Step 2: Normalisasi Matriks & Hitung Eigenvector (Bobot Prioritas)
  const weights = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      const normalizedValue = matrix[i][j] / colSums[j];
      rowSum += normalizedValue;
    }
    weights[i] = rowSum / n;
  }

  // Step 3: Hitung Consistency Ratio (CR)
  const weightedSumValue = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      weightedSumValue[i] += matrix[i][j] * weights[j];
    }
  }

  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    lambdaMax += weightedSumValue[i] / weights[i];
  }
  lambdaMax = lambdaMax / n;

  const CI = (lambdaMax - n) / (n - 1);
  const CR = CI / (RI[n - 1] || 1); 

  return {
    weights: weights,         // Ini hasil akhir bobotnya yang bakal dipake TOPSIS
    lambdaMax: lambdaMax,
    CI: CI,
    CR: CR,
    isConsistent: CR <= 0.1   // Status valid atau nggaknya
  };
}