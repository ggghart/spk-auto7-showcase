"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, ShieldCheck, AlertCircle, X, KeySquare, Loader2, CheckCircle2, Eye, EyeOff, Info, CheckSquare, Code2, MonitorPlay } from "lucide-react";
import { supabase } from "../lib/supabase"; 

export default function LoginPage() {
  const router = useRouter();
  
  // STATE LOGIN FORM
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);

  // STATE MODAL LUPA PASSWORD
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // STATE MODAL INFO PORTFOLIO & FLOATING BUTTON
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [hasUnderstood, setHasUnderstood] = useState(false);

  // ==========================================
  // STATE BARU: ANIMASI MOBIL NGELIRIK KURSOR
  // ==========================================
  const [carTransform, setCarTransform] = useState("perspective(1000px) rotateY(0deg) rotateZ(0deg) scale(1)");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfoModal(true);
    }, 500); 
    
    return () => clearTimeout(timer);
  }, []);

  // ==========================================
  // FUNGSI ANIMASI KURSOR (JALAN DI KOLOM KANAN AJA)
  // ==========================================
  const handleRightSideMouseMove = (e: React.MouseEvent) => {
    // Karena event ini cuma ada di div kanan, kita aman ngambil nilai X & Y kursor
    const { clientX, clientY } = e;
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Hitung rasio Y dari -1 (atas layar) sampai 1 (bawah layar)
    const yRatio = (clientY - height / 2) / (height / 2);
    
    // Hitung rasio X dari 0 (tengah layar) sampai 1 (paling kanan)
    const xRatio = (clientX - width / 2) / (width / 2);
    
    // Logika Orientasi: 
    // yRatio ngatur moncong naik turun (Pitch / rotateZ)
    // xRatio ngatur seberapa nengok dia ke arah kursor (Yaw / rotateY)
    const rotateZ = yRatio * 15; // Maksimal nunduk/ndangak 15 derajat
    const rotateY = xRatio * 20; // Maksimal nengok 20 derajat ke arah layar kanan
    
    // Set style transformnya (kasih scale 1.15 biar seakan-akan maju dikit)
    setCarTransform(`perspective(1000px) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(1.15)`);
  };

  const handleRightSideMouseLeave = () => {
    // Kalau kursor keluar dari form login, mobil balik ke posisi semula
    setCarTransform("perspective(1000px) rotateY(0deg) rotateZ(0deg) scale(1)");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMessage("Username dan password tidak boleh kosong bro!");
      return;
    }
    try {
      setIsLoading(true);
      const dummyEmail = `${username.toLowerCase().replace(/\s/g, '')}@auto7.com`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: password,
      });
      if (error) throw error; 
      if (data.user) {
        router.push("/dashboard");
      }
    } catch (error: any) {
      setErrorMessage("Username atau Password yang Anda masukkan salah. Silakan coba lagi.");
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUsername) {
      setResetError("Masukkan username Anda terlebih dahulu.");
      return;
    }
    try {
      setIsResetting(true);
      setResetError(null);
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", `%${resetUsername}%`) 
        .limit(1);
      if (checkError) throw checkError;
      if (!existingUser || existingUser.length === 0) {
        setResetError("Username tidak ditemukan di sistem Auto7!");
        setIsResetting(false);
        return; 
      }
      const { error: insertError } = await supabase
        .from("password_reset_requests")
        .insert([{ username: resetUsername }]);
      if (insertError) throw insertError;
      setResetSuccess(true);
    } catch (error: any) {
      console.error("Error minta reset:", error);
      setResetError("Gagal memverifikasi data. Pastikan koneksi aman.");
    } finally {
      setIsResetting(false);
    }
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetUsername("");
    setResetSuccess(false);
    setResetError(null);
  };

  return (
    <div className="min-h-screen flex font-sans relative bg-slate-900 lg:bg-slate-50 overflow-hidden">
      
      {/* FLOATING BUTTON INFO */}
      <button 
        onClick={() => setShowInfoModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-red-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] hover:bg-red-700 transition-all hover:scale-110 flex items-center justify-center group animate-bounce duration-1000"
        title="Informasi Portfolio"
      >
        <Info className="w-6 h-6 animate-pulse" />
        <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Info Portfolio
        </span>
      </button>

      {/* BACKGROUND KHUSUS MOBILE */}
      <div className="absolute inset-0 z-0 lg:hidden">
        <Image 
          src="/mobil1.png" 
          alt="Premium Carwash Auto7" 
          fill
          priority
          className="object-cover" 
        />
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10"></div>
      </div>

      {/* ==========================================
          SISI KIRI: DESKTOP ONLY DENGAN ANIMASI INTERAKTIF
          ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-end justify-center overflow-hidden z-10">
        
        {/* KONTENER GAMBAR MOBIL YANG DIKENDALIKAN STATE */}
        <div 
          className="absolute inset-0 transition-transform duration-200 ease-out origin-center"
          style={{ transform: carTransform }}
        >
          <Image 
            src="/mobil1.png" 
            alt="Premium Carwash Auto7" 
            fill
            priority
            className="object-cover" 
          />
        </div>
        
        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 pointer-events-none"></div>
        
        <div className="relative z-20 p-16 w-full text-left animate-in fade-in slide-in-from-bottom-8 duration-1000 pointer-events-none">
          <div className="inline-flex items-center space-x-2 bg-red-600/80 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 shadow-lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Premium Wash & Detailing</span>
          </div>
          <h2 className="text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg">
            Menjaga Kualitas,<br />
            <span className="text-red-500">Meningkatkan Kepercayaan.</span>
          </h2>
          <p className="text-slate-200 max-w-md text-base leading-relaxed drop-shadow-md font-medium">
            Sistem Pendukung Keputusan internal untuk memastikan rantai pasok dan kualitas material detailing selalu dalam standar tertinggi.
          </p>
        </div>
      </div>

      {/* ==========================================
          SISI KANAN: FORM LOGIN (SEKALIGUS AREA SENSOR KURSOR)
          ========================================== */}
      <div 
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative z-20 min-h-screen lg:min-h-0 lg:bg-slate-50"
        onMouseMove={handleRightSideMouseMove}
        onMouseLeave={handleRightSideMouseLeave}
      >
        
        <div 
          className="absolute inset-0 z-0 hidden lg:block opacity-[0.15]" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        ></div>

        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-red-500/10 blur-3xl hidden lg:block z-0 pointer-events-none"></div>

        <div className="relative w-full max-w-md bg-white/50 lg:bg-white backdrop-blur-sm lg:backdrop-blur-none rounded-3xl lg:rounded-[2rem] shadow-2xl lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/50 lg:border-slate-100/80 animate-in fade-in zoom-in-95 duration-700 z-10 mb-8 lg:mb-0">
          
          <div 
            className="absolute inset-0 z-0 pointer-events-none rounded-3xl lg:rounded-[2rem] p-[2px] overflow-hidden lg:hidden"
            style={{
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          >
            <div 
              className="absolute inset-[-100%] animate-spin bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_80%,#ffffff_100%)] opacity-100"
              style={{ animationDuration: '3s' }}
            ></div>
          </div>

          <div className="relative z-10 p-8 sm:p-10 lg:p-12 space-y-10">
            <div className="text-left">
              <Image 
                src="/auto7.png" 
                alt="Logo Auto7" 
                width={160} 
                height={50} 
                priority
                className="object-contain -ml-2 mb-4 drop-shadow-sm lg:drop-shadow-none"
              />
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight drop-shadow-sm lg:drop-shadow-none">
                Selamat Datang Kembali
              </h1>
              <p className="text-slate-700 lg:text-slate-500 font-medium text-sm mt-1 drop-shadow-sm lg:drop-shadow-none">
                Silakan login ke SPK Logistik Auto7.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 lg:text-slate-700 uppercase tracking-wider mb-2 drop-shadow-sm lg:drop-shadow-none">
                    Username
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-600 lg:text-slate-400 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/50 lg:bg-slate-50/50 border border-white/50 lg:border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-sm font-bold lg:font-medium placeholder-slate-600 lg:placeholder-slate-400 shadow-inner lg:shadow-none hover:bg-white"
                      placeholder="Masukkan username"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-800 lg:text-slate-700 uppercase tracking-wider drop-shadow-sm lg:drop-shadow-none">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="text-xs font-bold lg:font-semibold text-red-600 hover:text-red-700 transition-colors drop-shadow-sm lg:drop-shadow-none focus:outline-none"
                    >
                      Lupa Password?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-600 lg:text-slate-400 group-focus-within:text-red-600 transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3.5 bg-white/50 lg:bg-slate-50/50 border border-white/50 lg:border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-sm font-bold lg:font-medium placeholder-slate-600 lg:placeholder-slate-400 shadow-inner lg:shadow-none hover:bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-600 lg:text-slate-400 hover:text-red-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-red-600/30 lg:shadow-red-600/20 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 uppercase tracking-wide overflow-hidden relative group"
              >
                <span className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/20 skew-x-[45deg] group-hover:left-[200%] transition-all duration-700 ease-in-out"></span>
                
                {isLoading ? (
                  <span className="flex items-center relative z-10">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Memproses Akses...
                  </span>
                ) : (
                  <span className="relative z-10">Masuk</span>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="absolute bottom-6 w-full text-center z-10 px-4">
          <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-white/60 lg:text-slate-400 hover:text-white lg:hover:text-slate-600 transition-colors cursor-default drop-shadow-sm lg:drop-shadow-none pointer-events-none">
            &copy; 2026 AUTO7 Carwash. All rights reserved.
          </p>
        </div>

      </div>

      {/* MODAL ERROR CUSTOM */}
      {errorMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 relative">
            <button 
              onClick={() => setErrorMessage(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4 mt-2 border border-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Akses Ditolak</h3>
            <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">
              {errorMessage}
            </p>
            <button
              onClick={() => setErrorMessage(null)}
              className="w-full py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* MODAL INFO PORTFOLIO */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500 relative flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-red-600 p-6 text-white text-center relative shrink-0">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-white/20 mb-3 backdrop-blur-sm border border-white/30 shadow-inner">
                <Code2 className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Project Showcase</h2>
              <p className="text-red-100 text-[13px] font-medium mt-1.5">Sistem Pendukung Keputusan Logistik Auto7 Carwash</p>
            </div>

            {/* Content Modal */}
            <div className="p-6 md:p-8 overflow-y-auto grow custom-scrollbar bg-white">
              <div className="space-y-8">
                
                {/* Section 1: Konteks Project */}
                <div>
                  <h3 className="text-slate-900 font-bold flex items-center mb-3 text-base">
                    <div className="bg-red-50 text-red-600 p-1.5 rounded-lg mr-3 border border-red-100 shadow-sm">
                      <MonitorPlay className="w-4 h-4" />
                    </div>
                    Tentang Sistem
                  </h3>
                  <div className="space-y-3 text-[14px] leading-relaxed text-slate-600 ml-11">
                    <p>
                      SPK Auto7 Carwash pada awalnya di-develop sebagai <strong className="text-slate-800 font-bold">internal project</strong> operasional perusahaan untuk mengoptimalkan proses pemilihan vendor logistik. Sistem ini menggunakan <em className="text-slate-700 not-italic font-medium">core engine</em> algoritma <strong className="text-red-600 font-bold">AHP dan TOPSIS</strong> guna menghasilkan rekomendasi yang presisi dan <strong className="text-slate-800 font-bold">data-driven</strong>.
                    </p>
                    <p>
                      Versi yang <em className="text-slate-700 not-italic font-medium">live</em> saat ini merupakan <strong className="text-slate-800 font-bold">cloned version</strong> yang di-deploy khusus untuk kebutuhan <em className="text-slate-700 not-italic font-medium">public showcase</em> dan portofolio. Keseluruhan ekosistem aplikasi beserta database-nya telah diisolasi secara penuh ke dalam <strong className="text-red-600 font-bold">sandbox environment</strong>. Dengan begitu, seluruh fungsionalitas sistem dapat di-explore secara <strong className="text-slate-800 font-bold">end-to-end</strong> dengan <strong className="text-red-600 font-bold">zero risk</strong> terhadap kerahasiaan <em className="text-slate-700 not-italic font-medium">real operational data</em> milik perusahaan.
                    </p>
                  </div>
                </div>

                {/* Section 2: Info Akun */}
                <div>
                  <h3 className="text-slate-900 font-bold flex items-center mb-4 text-base">
                    <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg mr-3 border border-blue-100 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                    Akses Akun
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 ml-11">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="font-bold text-red-600 text-xs uppercase tracking-wider mb-2">Role: Owner (Full Access)</div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-500 text-xs">Username:</span> 
                        <code className="text-slate-800 text-xs font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">owner.auto7</code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs">Password:</span> 
                        <code className="text-slate-800 text-xs font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">admin123</code>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="font-bold text-slate-600 text-xs uppercase tracking-wider mb-2">Role: Employee (Limited)</div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-500 text-xs">Username:</span> 
                        <code className="text-slate-800 text-xs font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">alexganteng</code>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-xs">Password:</span> 
                        <code className="text-slate-800 text-xs font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">baksotikus123</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Fitur Spesifik */}
                <div>
                  <h3 className="text-slate-900 font-bold flex items-center mb-2 text-base">
                    <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg mr-3 border border-amber-100 shadow-sm">
                      <KeySquare className="w-4 h-4" />
                    </div>
                    Guide Lupa Password
                  </h3>
                  <p className="leading-relaxed text-[14px] text-slate-600 ml-11">
                    Fitur lupa password akan diteruskan langsung ke <strong className="text-slate-800 font-bold">Menu Profil</strong> pada akun Owner. Melalui menu tersebut, pihak Owner dapat meninjau dan menyetujui permintaan pembaruan kata sandi secara manual.
                  </p>
                </div>

              </div>
            </div>

            {/* Footer Modal dengan Checkbox */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
              <label className="flex items-start space-x-3 cursor-pointer group mb-5 px-2">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input 
                    type="checkbox" 
                    className="peer sr-only"
                    checked={hasUnderstood}
                    onChange={(e) => setHasUnderstood(e.target.checked)}
                  />
                  <div className="w-5 h-5 bg-white border-2 border-slate-300 rounded peer-checked:bg-red-600 peer-checked:border-red-600 transition-colors flex items-center justify-center">
                    <CheckSquare className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-[13px] font-medium text-slate-600 select-none group-hover:text-slate-900 transition-colors leading-relaxed pt-0.5">
                  Saya mengerti.
                </span>
              </label>

              <button
                onClick={() => setShowInfoModal(false)}
                disabled={!hasUnderstood}
                className="w-full py-3.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-wide"
              >
                Masuk ke Aplikasi
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL LUPA PASSWORD (KIRIM KE OWNER) */}
      {showResetModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative text-center">
            
            <button 
              onClick={closeResetModal}
              disabled={isResetting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {resetSuccess ? (
              <div className="p-8">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 mb-5 border-4 border-emerald-100">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Permintaan Terkirim!</h3>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Pemberitahuan reset password untuk username <strong className="text-slate-800">{resetUsername}</strong> telah diteruskan ke Owner. Silakan hubungi Owner untuk mendapatkan password baru Anda.
                </p>
                <button
                  onClick={closeResetModal}
                  className="w-full py-3.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-lg shadow-slate-900/20"
                >
                  Kembali ke Login
                </button>
              </div>
            ) : (
              <div className="p-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-5 border border-red-100">
                  <KeySquare className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Lupa Password?</h3>
                <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
                  Masukkan username Anda. Sistem akan mengirimkan notifikasi kepada Owner untuk mereset kata sandi akun Anda.
                </p>

                <form onSubmit={handleResetRequest} className="space-y-6">
                  <div>
                    <div className="relative group text-left">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-red-600 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={resetUsername}
                        onChange={(e) => setResetUsername(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-sm font-medium placeholder-slate-400 hover:bg-white"
                        placeholder="Ketik username Anda..."
                      />
                    </div>
                    {resetError && <p className="text-red-500 text-xs font-bold mt-2 text-left px-1">{resetError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-red-600/20 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                        Mengirim...
                      </>
                    ) : (
                      "Kirim Permintaan ke Owner"
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}