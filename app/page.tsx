"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, ShieldCheck, AlertCircle, X, KeySquare, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "../lib/supabase"; 

export default function LoginPage() {
  const router = useRouter();
  
  // STATE LOGIN FORM
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // STATE BARU: MODAL LUPA PASSWORD
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // ==========================================
  // FUNGSI LOGIN
  // ==========================================
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

  // ==========================================
  // FUNGSI MINTA RESET PASSWORD (KIRIM KE OWNER)
  // ==========================================
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetUsername) {
      setResetError("Masukkan username Anda terlebih dahulu.");
      return;
    }

    try {
      setIsResetting(true);
      setResetError(null);

      // 1. CEK DULU KE TABEL PROFILES (Apakah Pegawai Ini Ada?)
      // Note: Di sini gw ngecek ke kolom 'full_name'. Kalau di tabel lu ada kolom 'username', ganti ya.
      // Pakai ilike biar "Ojan" dan "ojan" tetep kebaca.
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .ilike("full_name", `%${resetUsername}%`) 
        .limit(1);

      if (checkError) throw checkError;

      // Kalau array-nya kosong, berarti orangnya kagak ada!
      if (!existingUser || existingUser.length === 0) {
        setResetError("Username tidak ditemukan di sistem Auto7!");
        setIsResetting(false);
        return; // Berhenti di sini, jangan di-insert!
      }

      // 2. KALAU ORANGNYA ADA, BARU KITA INSERT REQUEST-NYA
      const { error: insertError } = await supabase
        .from("password_reset_requests")
        .insert([{ username: resetUsername }]);

      if (insertError) throw insertError;

      // Berhasil ngirim ke Owner
      setResetSuccess(true);
    } catch (error: any) {
      console.error("Error minta reset:", error);
      setResetError("Gagal memverifikasi data. Pastikan koneksi aman.");
    } finally {
      setIsResetting(false);
    }
  };

  // Fungsi tutup modal reset
  const closeResetModal = () => {
    setShowResetModal(false);
    setResetUsername("");
    setResetSuccess(false);
    setResetError(null);
  };

  return (
    <div className="min-h-screen flex font-sans relative bg-slate-900 lg:bg-slate-50 overflow-hidden">
      
      {/* ==========================================
          BACKGROUND KHUSUS MOBILE (LASER AMAN)
          ========================================== */}
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
          SISI KIRI: DESKTOP ONLY DENGAN ANIMASI MASUK
          ========================================== */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-end justify-center overflow-hidden z-10 group">
        {/* Gambar mobil pelan-pelan nge-zoom kalau di hover (Cinematic Feel) */}
        <div className="absolute inset-0 transform transition-transform duration-[10000ms] ease-out group-hover:scale-110">
          <Image 
            src="/mobil1.png" 
            alt="Premium Carwash Auto7" 
            fill
            priority
            className="object-cover" 
          />
        </div>
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
        
        {/* Teks animasi masuk dari bawah */}
        <div className="relative z-20 p-16 w-full text-left animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
          SISI KANAN: FORM LOGIN (ELEVATED CARD + SAAS GRID)
          ========================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative z-20 min-h-screen lg:min-h-0 lg:bg-slate-50">
        
        {/* DOT GRID PATTERN KHUSUS DESKTOP */}
        <div 
          className="absolute inset-0 z-0 hidden lg:block opacity-[0.15]" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        ></div>

        {/* GLOWING ORB MERAH SAMAR DI DESKTOP */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-red-500/10 blur-3xl hidden lg:block z-0 pointer-events-none"></div>

        {/* BUNGKUS KARTU (GLASSMORPHISM HP + ELEVATED CARD DESKTOP) */}
        <div className="relative w-full max-w-md bg-white/50 lg:bg-white backdrop-blur-sm lg:backdrop-blur-none rounded-3xl lg:rounded-[2rem] shadow-2xl lg:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/50 lg:border-slate-100/80 animate-in fade-in zoom-in-95 duration-700 z-10 mb-8 lg:mb-0">
          
          {/* ==========================================
              EFEK LASER CHROME (HANYA DI MOBILE)
              ========================================== */}
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

          {/* ==========================================
              ISI FORM 
              ========================================== */}
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
                Silakan login ke portal SPK Logistik Auto7.
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
                    {/* TOMBOL LUPA PASSWORD */}
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 bg-white/50 lg:bg-slate-50/50 border border-white/50 lg:border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-sm font-bold lg:font-medium placeholder-slate-600 lg:placeholder-slate-400 shadow-inner lg:shadow-none hover:bg-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-red-600/30 lg:shadow-red-600/20 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 uppercase tracking-wide overflow-hidden relative group"
              >
                {/* Efek kilatan cahaya (Shine) pas di hover */}
                <span className="absolute top-0 -left-[100%] w-1/2 h-full bg-white/20 skew-x-[45deg] group-hover:left-[200%] transition-all duration-700 ease-in-out"></span>
                
                {isLoading ? (
                  <span className="flex items-center relative z-10">
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Memproses Akses...
                  </span>
                ) : (
                  <span className="relative z-10">Masuk ke Portal</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ==========================================
            COPYRIGHT FOOTER (Premium Minimalist)
            ========================================== */}
        <div className="absolute bottom-6 w-full text-center z-10 px-4">
          <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-white/60 lg:text-slate-400 hover:text-white lg:hover:text-slate-600 transition-colors cursor-default drop-shadow-sm lg:drop-shadow-none">
            &copy; 2026 AUTO7 Carwash. All rights reserved.
          </p>
        </div>

      </div>

      {/* ==========================================
          MODAL ERROR CUSTOM
          ========================================== */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
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

      {/* ==========================================
          MODAL LUPA PASSWORD (KIRIM KE OWNER)
          ========================================== */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 relative text-center">
            
            <button 
              onClick={closeResetModal}
              disabled={isResetting}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            {resetSuccess ? (
              // TAMPILAN JIKA SUKSES
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
              // TAMPILAN FORM REQUEST
              <div className="p-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-5 border border-blue-100">
                  <KeySquare className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Lupa Password?</h3>
                <p className="text-sm text-slate-500 mb-6 px-2 leading-relaxed">
                  Masukkan username Anda. Sistem akan mengirimkan notifikasi kepada Owner untuk mereset kata sandi akun Anda.
                </p>

                <form onSubmit={handleResetRequest} className="space-y-6">
                  <div>
                    <div className="relative group text-left">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={resetUsername}
                        onChange={(e) => setResetUsername(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all text-sm font-medium placeholder-slate-400 hover:bg-white"
                        placeholder="Ketik username Anda..."
                      />
                    </div>
                    {resetError && <p className="text-red-500 text-xs font-bold mt-2 text-left px-1">{resetError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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