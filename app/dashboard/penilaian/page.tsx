"use client";

import { useState } from "react";
import { Calculator, AlertTriangle, CheckCircle2, Truck, Trophy, ArrowRight, ArrowLeft, Save } from "lucide-react";

const criteriaList = ["C1 Biaya", "C2 Kecepatan", "C3 Ketepatan", "C4 Pelacakan", "C5 Layanan", "C6 Keamanan"];
const alternativesList = ["Lalamove", "Deliveree", "GoBox"];

export default function PenilaianAHPPage() {
  const n = criteriaList.length;
  const m = alternativesList.length;
  
  // State untuk melacak langkah saat ini (1 = AHP, 2 = TOPSIS, 3 = Hasil)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  
  // State AHP
  const [matrix, setMatrix] = useState<number[][]>(Array(n).fill(null).map(() => Array(n).fill(1)));
  const [crStatus, setCrStatus] = useState<"idle" | "success" | "error">("idle");
  const [crValue, setCrValue] = useState<number>(0);

  // State TOPSIS (Baris = Alternatif, Kolom = Kriteria)
  const [topsisMatrix, setTopsisMatrix] = useState<string[][]>(Array(m).fill(null).map(() => Array(n).fill("")));

  // Handle Input AHP
  const handleValueChange = (row: number, col: number, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;
    const newMatrix = [...matrix.map(r => [...r])];
    newMatrix[row][col] = numValue;
    newMatrix[col][row] = 1 / numValue; // Rumus kebalikan
    setMatrix(newMatrix);
    setCrStatus("idle");
  };

  // Handle Validasi AHP
  const handleHitungCR = () => {
    const simulatedCR = 0.08; // Dummy hitungan
    setCrValue(simulatedCR);
    if (simulatedCR <= 0.1) {
      setCrStatus("success");
    } else {
      setCrStatus("error");
    }
  };

  // Handle Input TOPSIS
  const handleTopsisChange = (altIndex: number, critIndex: number, value: string) => {
    const newTopsisMatrix = [...topsisMatrix.map(r => [...r])];
    newTopsisMatrix[altIndex][critIndex] = value;
    setTopsisMatrix(newTopsisMatrix);
  };

  // Handle Proses Akhir
  const handleProsesTopsis = () => {
    setCurrentStep(3); // Pindah ke layar hasil akhir
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* =========================================
          LANGKAH 1: MATRIKS AHP 
          ========================================= */}
      {currentStep === 1 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-red-100 rounded-xl text-red-600 shadow-sm">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Langkah 1: Input Matriks AHP</h1>
              <p className="text-slate-500 text-sm mt-1">
                Bandingkan tingkat kepentingan antar kriteria. Skala 1 (Sama Penting) hingga 9 (Mutlak Lebih Penting).
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto p-6">
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 border border-slate-200 bg-slate-50 text-slate-600 font-bold w-32">Kriteria</th>
                    {criteriaList.map((crit, i) => (
                      <th key={i} className="p-3 border border-slate-200 bg-red-50 text-red-700 font-bold w-24">
                        {crit.split(" ")[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteriaList.map((rowCrit, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="p-3 border border-slate-200 bg-red-50 text-red-700 font-bold text-left">
                        {rowCrit}
                      </td>
                      {criteriaList.map((colCrit, colIndex) => {
                        const isDiagonal = rowIndex === colIndex;
                        const isLowerTriangle = rowIndex > colIndex;
                        const val = matrix[rowIndex][colIndex];
                        const displayVal = Number.isInteger(val) ? val : val.toFixed(2);

                        return (
                          <td key={colIndex} className={`p-2 border border-slate-200 ${isDiagonal ? 'bg-slate-100' : isLowerTriangle ? 'bg-slate-50' : 'bg-white'}`}>
                            {isDiagonal ? (
                              <span className="text-slate-400 font-bold">1</span>
                            ) : isLowerTriangle ? (
                              <span className="text-slate-500 font-medium">{displayVal}</span>
                            ) : (
                              <select
                                value={val}
                                onChange={(e) => handleValueChange(rowIndex, colIndex, e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none cursor-pointer bg-white text-slate-700 font-medium"
                              >
                                {[1,2,3,4,5,6,7,8,9].map(num => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                onClick={handleHitungCR}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
              >
                Hitung & Validasi CR
              </button>
            </div>
          </div>

          {/* Notifikasi Validasi AHP */}
          {crStatus !== "idle" && (
            <div className={`mt-6 p-5 rounded-xl border flex items-start space-x-4 shadow-sm ${
              crStatus === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
            }`}>
              {crStatus === "success" ? <CheckCircle2 className="h-6 w-6 text-emerald-600 mt-0.5" /> : <AlertTriangle className="h-6 w-6 text-rose-600 mt-0.5" />}
              <div className="flex-1">
                <h3 className="font-bold text-lg">{crStatus === "success" ? "Validasi Berhasil!" : "Validasi Gagal!"}</h3>
                <p className="mt-1 font-medium opacity-90">
                  Nilai Consistency Ratio (CR) = {crValue} {crStatus === "success" ? " (Konsisten, ≤ 0.1)." : " (Tidak Konsisten, > 0.1). Mohon perbaiki matriks."}
                </p>
                {crStatus === "success" && (
                  <button 
                    onClick={() => setCurrentStep(2)} // Pindah ke Langkah 2
                    className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow flex items-center"
                  >
                    Lanjut ke Evaluasi TOPSIS <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================
          LANGKAH 2: INPUT TOPSIS
          ========================================= */}
      {currentStep === 2 && (
        <div className="animate-in slide-in-from-right-8 fade-in duration-500">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Langkah 2: Evaluasi Alternatif TOPSIS</h1>
              <p className="text-slate-500 text-sm mt-1">
                Masukkan nilai performa aktual untuk setiap penyedia jasa terhadap masing-masing kriteria.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto p-6">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 border border-slate-200 bg-slate-50 text-slate-600 font-bold w-48">Alternatif</th>
                    {criteriaList.map((crit, i) => (
                      <th key={i} className="p-3 border border-slate-200 bg-blue-50 text-blue-700 font-bold text-center">
                        {crit.split(" ")[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternativesList.map((alt, altIndex) => (
                    <tr key={altIndex} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 border border-slate-200 font-bold text-slate-800 bg-slate-50">
                        {alt}
                      </td>
                      {criteriaList.map((_, critIndex) => (
                        <td key={critIndex} className="p-2 border border-slate-200 bg-white">
                          <input
                            type="number"
                            placeholder="0"
                            value={topsisMatrix[altIndex][critIndex]}
                            onChange={(e) => handleTopsisChange(altIndex, critIndex, e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-center font-medium"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button 
                onClick={() => setCurrentStep(1)} // Balik ke Langkah 1
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-all flex items-center"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Kembali ke AHP
              </button>
              
              <button 
                onClick={handleProsesTopsis} // Lanjut ke Hasil
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center"
              >
                Proses Ranking TOPSIS <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          LANGKAH 3: HASIL AKHIR 
          ========================================= */}
      {currentStep === 3 && (
        <div className="animate-in zoom-in-95 fade-in duration-500">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl border border-slate-700 text-white relative overflow-hidden">
            {/* Hiasan background */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 text-slate-700/30">
              <Trophy className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-red-600/20 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-red-500/30">
                <span>Rekomendasi Sistem</span>
              </div>
              
              <h2 className="text-slate-300 font-medium mb-1">Peringkat #1 Logistik Terbaik</h2>
              <div className="text-5xl font-extrabold text-white mb-6 tracking-tight">
                Lalamove
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:space-x-6 mb-8">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Skor Preferensi (Vi)</p>
                  <p className="text-2xl font-bold text-emerald-400">0.854</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Status CR</p>
                  <p className="text-2xl font-bold text-blue-400">Konsisten</p>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                 <button 
                  onClick={() => setCurrentStep(2)} 
                  className="px-5 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all flex items-center"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" /> Revisi Nilai
                </button>
                <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg flex items-center">
                  <Save className="mr-2 w-5 h-5" />
                  Simpan ke Riwayat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}