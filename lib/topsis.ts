// lib/topsis.ts

// Sekarang criteriaTypes dilempar dari database lewat page.tsx
export function calculateTOPSIS(matrix: number[][], weights: number[], criteriaTypes: boolean[]) {
  const numAlternatives = matrix.length;
  if (numAlternatives === 0 || weights.length === 0) return null;
  const numCriteria = matrix[0].length;

  // 1. Normalisasi Matriks Keputusan
  const normalizedMatrix = Array(numAlternatives).fill(0).map(() => Array(numCriteria).fill(0));
  for (let j = 0; j < numCriteria; j++) {
    let sumSquares = 0;
    for (let i = 0; i < numAlternatives; i++) {
      sumSquares += Math.pow(matrix[i][j], 2);
    }
    const sqrtSum = Math.sqrt(sumSquares);
    for (let i = 0; i < numAlternatives; i++) {
      normalizedMatrix[i][j] = sqrtSum === 0 ? 0 : matrix[i][j] / sqrtSum;
    }
  }

  // 2. Matriks Keputusan Ternormalisasi Terbobot
  const weightedMatrix = Array(numAlternatives).fill(0).map(() => Array(numCriteria).fill(0));
  for (let i = 0; i < numAlternatives; i++) {
    for (let j = 0; j < numCriteria; j++) {
      weightedMatrix[i][j] = normalizedMatrix[i][j] * weights[j];
    }
  }

  // 3. Tentukan Solusi Ideal Positif (A+) dan Negatif (A-)
  const idealPositive = Array(numCriteria).fill(0);
  const idealNegative = Array(numCriteria).fill(0);

  for (let j = 0; j < numCriteria; j++) {
    const columnValues = weightedMatrix.map(row => row[j]);
    const maxVal = Math.max(...columnValues);
    const minVal = Math.min(...columnValues);

    if (criteriaTypes[j]) { 
      // Kalau Benefit
      idealPositive[j] = maxVal;
      idealNegative[j] = minVal;
    } else { 
      // Kalau Cost
      idealPositive[j] = minVal;
      idealNegative[j] = maxVal;
    }
  }

  // 4. Hitung Jarak (D+ dan D-)
  const distancePositive = Array(numAlternatives).fill(0);
  const distanceNegative = Array(numAlternatives).fill(0);

  for (let i = 0; i < numAlternatives; i++) {
    let sumPos = 0;
    let sumNeg = 0;
    for (let j = 0; j < numCriteria; j++) {
      sumPos += Math.pow(weightedMatrix[i][j] - idealPositive[j], 2);
      sumNeg += Math.pow(weightedMatrix[i][j] - idealNegative[j], 2);
    }
    distancePositive[i] = Math.sqrt(sumPos);
    distanceNegative[i] = Math.sqrt(sumNeg);
  }

  // 5. Hitung Nilai Preferensi (Vi)
  const preferences = Array(numAlternatives).fill(0);
  for (let i = 0; i < numAlternatives; i++) {
    const totalDistance = distancePositive[i] + distanceNegative[i];
    preferences[i] = totalDistance === 0 ? 0 : distanceNegative[i] / totalDistance;
  }

  return preferences;
}