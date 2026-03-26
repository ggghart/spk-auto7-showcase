"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase"; 
import { Calculator, AlertTriangle, CheckCircle2, Truck, Trophy, ArrowRight, ArrowLeft, Save, Loader2, X, Info, Wand2 } from "lucide-react";
import { calculateAHP } from "../../../lib/ahp";
import { calculateTOPSIS } from "../../../lib/topsis";

type Criteria = { id: string; name: string; attribute: string; weight: number };
type Alternative = { id: string; name: string; status: string };

export default function PenilaianAHPPage() {
  const router = useRouter();
  
  const [criteriaList, setCriteriaList] = useState<Criteria[]>([]);
  const [alternativesList, setAlternativesList] = useState<Alternative[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [keterangan, setKeterangan] = useState("");
  const [showWarning, setShowWarning] = useState(false);

  const [matrix, setMatrix] = useState<number[][]>([]);
  const [crStatus, setCrStatus] = useState<"idle" | "success" | "error">("idle");
  const [crValue, setCrValue] = useState<number>(0);
  const [ahpWeights, setAhpWeights] = useState<number[]>([]);

  const [topsisMatrix, setTopsisMatrix] = useState<string[][]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [winnerName, setWinnerName] = useState<string>("");
  const [winnerScore, setWinnerScore] = useState<number>(0);

  useEffect(() => {
    const fetchAwalData = async () => {
      try {
        const { data: dataCriteria, error: errCriteria } = await supabase
          .from("criteria")
          .select("*")
          .order("id", { ascending: true });
        if (errCriteria) throw errCriteria;

        const { data: dataAlternatives, error: errAlternatives } = await supabase
          .from("alternatives")
          .select("*")
          .eq("status", "Aktif")
          .order("name", { ascending: true });
        if (errAlternatives) throw errAlternatives;

        setCriteriaList(dataCriteria || []);
        setAlternativesList(dataAlternatives || []);

        const n = dataCriteria?.length || 0;
        const m = dataAlternatives?.length || 0;

        setMatrix(Array(n).fill(null).map(() => Array(n).fill(1)));
        setTopsisMatrix(Array(m).fill(null).map(() => Array(n).fill("")));
      } catch (error) {
        console.error("Gagal narik data dari database:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchAwalData();
  }, []);

  const handleValueChange = (row: number, col: number, value: string) => {
    let numValue = 0;
    
    if (value.includes('/')) {
      const [pembilang, penyebut] = value.split('/');
      numValue = parseInt(pembilang) / parseInt(penyebut);
    } else {
      numValue = parseFloat(value);
    }

    if (isNaN(numValue) || numValue <= 0) return;
    
    const newMatrix = [...matrix.map(r => [...r])];
    newMatrix[row][col] = numValue;
    newMatrix[col][row] = 1 / numValue; 
    setMatrix(newMatrix);
    setCrStatus("idle");
  };

  const handleHitungCR = async () => {
    if (!keterangan) {
      setShowWarning(true);
      return;
    }

    const ahpResult = calculateAHP(matrix);

    if (!ahpResult) {
       alert("Gagal menghitung matriks");
       return;
    }

    const calculatedCR = parseFloat(ahpResult.CR.toFixed(3)); 
    setCrValue(calculatedCR);
    setAhpWeights(ahpResult.weights); 

    if (calculatedCR <= 0.1) {
      setCrStatus("success");
      
      try {
        const updatePromises = criteriaList.map((crit, index) => {
          return supabase
            .from("criteria")
            .update({ weight: ahpResult.weights[index] })
            .eq("id", crit.id);
        });
        
        await Promise.all(updatePromises);
        console.log("Berhasil menyimpan bobot AHP ke database!");
      } catch (error) {
        console.error("Gagal update bobot ke database:", error);
      }

    } else {
      setCrStatus("error");
    }
  };

  const handleTopsisChange = (altIndex: number, critIndex: number, value: string) => {
    const newTopsisMatrix = [...topsisMatrix.map(r => [...r])];
    newTopsisMatrix[altIndex][critIndex] = value;
    setTopsisMatrix(newTopsisMatrix);
  };

  const handleProsesTopsis = () => {
    const m = alternativesList.length;
    const n = criteriaList.length;

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (topsisMatrix[i][j] === "") {
          alert("Eh bro, isi dulu semua nilai evaluasi logistiknya ya!");
          return;
        }
      }
    }

    const numericMatrix = topsisMatrix.map(row => row.map(val => parseFloat(val)));

    const criteriaTypes = criteriaList.map(crit => crit.attribute.toLowerCase() === "benefit");

    const preferences = calculateTOPSIS(numericMatrix, ahpWeights, criteriaTypes);

    if (!preferences) {
      alert("Gagal menghitung TOPSIS. Pastikan AHP sudah dihitung di Langkah 1.");
      return;
    }

    let maxScore = -1;
    let maxIndex = -1;

    preferences.forEach((score, index) => {
      if (score > maxScore) {
        maxScore = score;
        maxIndex = index;
      }
    });

    setWinnerName(alternativesList[maxIndex].name); 
    setWinnerScore(parseFloat(maxScore.toFixed(3)));
    setCurrentStep(3); 
  };

  const handleSimpanRiwayat = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from("decision_history")
        .insert([
          {
            description: keterangan,
            winner_name: winnerName,
            final_score: winnerScore,
            cr_status: crStatus === "success" ? "Konsisten" : "Tidak Konsisten"
          }
        ]);

      if (error) throw error;
      router.push("/dashboard/riwayat");

    } catch (error: any) {
      console.error("Gagal menyimpan ke database:", error);
      alert(`Gagal menyimpan data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // FUNGSI MAGIC AUTO-FILL 
  // ==========================================
  const handleAutoFillAHP = () => {
    setKeterangan("Demo Rekrutmen & Portofolio Auto7");
    const n = criteriaList.length;
    const newMatrix = Array(n).fill(null).map(() => Array(n).fill(1));
    
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        let val = (j - i) + 1; 
        if (val > 9) val = 9;  
        newMatrix[i][j] = val;
        newMatrix[j][i] = 1 / val;
      }
    }
    setMatrix(newMatrix);
    setCrStatus("idle");
  };

  const handleAutoFillTopsis = () => {
    const m = alternativesList.length;
    const n = criteriaList.length;
    const newTopsis = Array(m).fill(null).map(() => Array(n).fill(""));
    
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
         newTopsis[i][j] = (Math.floor(Math.random() * 5) + 1).toString();
      }
    }
    setTopsisMatrix(newTopsis);
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Menarik data dari database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-10">
      
      {/* ==========================================
          LANGKAH 1: AHP 
          ========================================== */}
      {currentStep === 1 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-xl text-red-600 shadow-sm">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Langkah 1: Input Matriks AHP</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Bandingkan tingkat kepentingan antar kriteria dari database.
                </p>
              </div>
            </div>
            <button 
              onClick={handleAutoFillAHP}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              <Wand2 className="w-4 h-4 mr-2" /> Isi Otomatis (Demo)
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Keterangan Penilaian (Wajib)
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Pemilihan Logistik Shampo Wax Bulan Depan"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-slate-800 font-medium bg-white"
                required
              />
            </div>

            <div className="p-5 sm:p-6 bg-red-50/40 border-b border-slate-200 flex flex-col md:flex-row gap-6 lg:gap-8">
              <div className="flex-1">
                <h3 className="text-[11px] font-bold text-slate-500 mb-3 flex items-center uppercase tracking-widest">
                  <Info className="w-4 h-4 mr-1.5 text-red-500" /> Panduan Skala AHP
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs"><span className="font-extrabold text-slate-800 text-sm mr-1.5">1</span>Sama Penting</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs"><span className="font-extrabold text-slate-800 text-sm mr-1.5">3</span>Sedikit Lebih Penting</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs"><span className="font-extrabold text-slate-800 text-sm mr-1.5">5</span>Lebih Penting</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs"><span className="font-extrabold text-slate-800 text-sm mr-1.5">7</span>Sangat Penting</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs"><span className="font-extrabold text-slate-800 text-sm mr-1.5">9</span>Mutlak Penting</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs text-slate-500 flex items-center justify-center italic">2, 4, 6, 8 (Nilai Tengah)</div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium italic">
                  *Pilih pecahan (1/3, 1/5) jika kriteria di kolom KIRI lebih kecil kepentingannya dari kolom ATAS.
                </p>
              </div>

              <div className="md:w-[40%] border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 lg:pl-8 flex flex-col justify-center">
                <h3 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Keterangan Baris & Kolom</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] text-slate-700">
                  {criteriaList.map(c => (
                    <div key={c.id} className="truncate pr-2" title={c.name}>
                      <span className="font-extrabold text-slate-900">{c.id}</span>: {c.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto p-0 sm:p-6 custom-scrollbar bg-slate-50/30">
              <table className="w-full text-sm text-center border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-3 sm:p-4 border-b sm:border border-slate-200 bg-slate-100 text-slate-700 font-bold w-[110px] sm:w-[160px] min-w-[110px] sm:min-w-[160px] sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-left whitespace-normal leading-tight">
                      Kriteria
                    </th>
                    {criteriaList.map((crit, i) => (
                      <th key={i} className="p-3 border-b sm:border border-slate-200 bg-red-50 text-red-700 font-bold w-24 whitespace-nowrap" title={crit.name}>
                        {crit.id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {criteriaList.map((rowCrit, rowIndex) => (
                    <tr key={rowIndex} className="group hover:bg-red-50/20 transition-colors">
                      <td className="p-3 sm:p-4 border-b sm:border border-slate-200 font-bold text-slate-800 bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-left group-hover:bg-red-50/50 w-[110px] sm:w-[160px] min-w-[110px] sm:min-w-[160px] whitespace-normal break-words leading-snug">
                        <div className="flex flex-col sm:flex-row sm:items-start">
                          <span className="text-red-600 sm:mr-2 text-xs sm:text-sm">{rowCrit.id}</span>
                          <span className="text-[11px] sm:text-sm text-slate-600 sm:text-slate-800 mt-0.5 sm:mt-0">{rowCrit.name}</span>
                        </div>
                      </td>
                      {criteriaList.map((colCrit, colIndex) => {
                        const isDiagonal = rowIndex === colIndex;
                        const isLowerTriangle = rowIndex > colIndex;
                        const val = matrix[rowIndex] && matrix[rowIndex][colIndex] ? matrix[rowIndex][colIndex] : 1;
                        
                        let displayVal = "";
                        if (val === 1) {
                          displayVal = "1";
                        } else if (val > 1) {
                          displayVal = Math.round(val).toString();
                        } else if (val > 0 && val < 1) {
                          displayVal = `1/${Math.round(1 / val)}`;
                        }

                        return (
                          <td key={colIndex} className={`p-2 border-b sm:border border-slate-200 ${isDiagonal ? 'bg-slate-100' : isLowerTriangle ? 'bg-slate-50/80' : 'bg-white'}`}>
                            {isDiagonal ? (
                              <div className="w-full flex items-center justify-center p-2 text-slate-400 font-bold bg-slate-100 rounded-lg">1</div>
                            ) : isLowerTriangle ? (
                              <div className="w-full flex items-center justify-center p-2 text-slate-500 font-medium">{displayVal}</div>
                            ) : (
                              <select
                                value={val >= 1 ? Math.round(val).toString() : `1/${Math.round(1/val)}`}
                                onChange={(e) => handleValueChange(rowIndex, colIndex, e.target.value)}
                                className="w-full min-w-[70px] p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none cursor-pointer bg-white text-slate-700 font-bold text-center hover:bg-slate-50 transition-colors appearance-none"
                                style={{ backgroundImage: 'none' }}
                              >
                                {["9", "8", "7", "6", "5", "4", "3", "2", "1", "1/2", "1/3", "1/4", "1/5", "1/6", "1/7", "1/8", "1/9"].map(opt => (
                                  <option key={opt} value={opt}>{opt}</option>
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
                    onClick={() => setCurrentStep(2)} 
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

      {/* ==========================================
          LANGKAH 2: TOPSIS 
          ========================================== */}
      {currentStep === 2 && (
        <div className="animate-in slide-in-from-right-8 fade-in duration-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600 shadow-sm">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Langkah 2: Evaluasi Alternatif TOPSIS</h1>
                <p className="text-slate-500 text-sm mt-1">
                  Masukkan nilai performa aktual menggunakan skala 1-5.
                </p>
              </div>
            </div>
            <button 
              onClick={handleAutoFillTopsis}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold rounded-xl shadow-md hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              <Wand2 className="w-4 h-4 mr-2" /> Isi Acak (Demo)
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 sm:p-6 bg-blue-50/50 border-b border-slate-200 flex flex-col md:flex-row gap-6 lg:gap-8">
              <div className="flex-1">
                <h3 className="text-[11px] font-bold text-slate-500 mb-3 flex items-center uppercase tracking-widest">
                  <Info className="w-4 h-4 mr-1.5 text-blue-500" /> Panduan Skala
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs whitespace-nowrap"><span className="font-extrabold text-rose-600 text-sm mr-1.5">1</span>Sangat Buruk</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs whitespace-nowrap"><span className="font-extrabold text-orange-500 text-sm mr-1.5">2</span>Buruk</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs whitespace-nowrap"><span className="font-extrabold text-amber-500 text-sm mr-1.5">3</span>Cukup</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs whitespace-nowrap"><span className="font-extrabold text-lime-600 text-sm mr-1.5">4</span>Baik</div>
                  <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm text-xs whitespace-nowrap"><span className="font-extrabold text-emerald-600 text-sm mr-1.5">5</span>Sangat Baik</div>
                </div>
              </div>

              <div className="md:w-[40%] border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 lg:pl-8 flex flex-col justify-center">
                <h3 className="text-[11px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Keterangan Kolom</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] text-slate-700">
                  {criteriaList.map(c => (
                    <div key={c.id} className="truncate pr-2" title={c.name}>
                      <span className="font-extrabold text-slate-900">{c.id}</span>: {c.name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto p-0 sm:p-6 custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="p-3 sm:p-4 border-b sm:border border-slate-200 bg-slate-100 text-slate-700 font-bold w-[120px] sm:w-[180px] min-w-[120px] sm:min-w-[180px] sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-normal leading-tight">
                      Alternatif
                    </th>
                    {criteriaList.map((crit, i) => (
                      <th key={i} className="p-3 border-b sm:border border-slate-200 bg-blue-50 text-blue-700 font-bold text-center min-w-[100px]" title={crit.name}>
                        {crit.id}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternativesList.map((alt, altIndex) => (
                    <tr key={altIndex} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-3 sm:p-4 border-b sm:border border-slate-200 font-bold text-slate-800 bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] whitespace-normal break-words leading-snug group-hover:bg-blue-50/50 w-[120px] sm:w-[180px] min-w-[120px] sm:min-w-[180px]">
                        {alt.name}
                      </td>
                      {criteriaList.map((_, critIndex) => (
                        <td key={critIndex} className="p-2.5 border-b sm:border border-slate-200 bg-white text-center">
                          <select
                            value={topsisMatrix[altIndex] && topsisMatrix[altIndex][critIndex] ? topsisMatrix[altIndex][critIndex] : ""}
                            onChange={(e) => handleTopsisChange(altIndex, critIndex, e.target.value)}
                            className="w-full max-w-[80px] p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-center font-bold text-slate-700 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors appearance-none"
                            style={{ backgroundImage: 'none' }}
                          >
                            <option value="" disabled>-</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <button 
                onClick={() => setCurrentStep(1)} 
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-all flex items-center"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Kembali ke AHP
              </button>
              
              <button 
                onClick={handleProsesTopsis} 
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center"
              >
                Proses Ranking TOPSIS <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          LANGKAH 3: HASIL
          ========================================== */}
      {currentStep === 3 && (
        <div className="animate-in zoom-in-95 fade-in duration-500">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-xl border border-slate-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 text-slate-700/30">
              <Trophy className="w-64 h-64" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 bg-red-600/20 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-red-500/30">
                <span>Rekomendasi Sistem</span>
              </div>
              
              <h2 className="text-slate-300 font-medium mb-1">Peringkat #1 Logistik Terbaik</h2>
              <div className="text-5xl font-extrabold text-white mb-6 tracking-tight">
                {winnerName}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:space-x-6 mb-8">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Skor Preferensi (Vi)</p>
                  <p className="text-2xl font-bold text-emerald-400">{winnerScore}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Status CR</p>
                  <p className="text-2xl font-bold text-blue-400">{crStatus === "success" ? "Konsisten" : "Tidak Konsisten"}</p>
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button 
                  onClick={() => setCurrentStep(2)} 
                  disabled={isSaving}
                  className="px-5 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all flex items-center disabled:opacity-50"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" /> Revisi Nilai
                </button>
                <button 
                  onClick={handleSimpanRiwayat}
                  disabled={isSaving}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 w-5 h-5" />
                      Simpan ke Riwayat
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL WARNING */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 relative">
            <button 
              onClick={() => setShowWarning(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 mb-4 mt-2 border border-amber-100">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Peringatan</h3>
            <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">
              Keterangan Penilaian wajib diisi bro! Silakan isi terlebih dahulu sebelum menghitung dan validasi matriks.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="w-full py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}

    </div>
  );
}