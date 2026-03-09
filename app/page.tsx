"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, ShieldCheck, AlertCircle, X } from "lucide-react";
import { supabase } from "../lib/supabase"; 

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE BARU BUAT NAMPILIN MODAL ERROR
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ganti alert bawaan browser jadi modal custom
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

      if (error) {
        throw error; 
      }

      if (data.user) {
        router.push("/dashboard");
      }

    } catch (error: any) {
      // Munculin pesan error di modal custom
      setErrorMessage("Username atau Password yang Anda masukkan salah. Silakan coba lagi.");
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      
      {/* SISI KIRI: Gambar Mobil Premium */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-end justify-center overflow-hidden">
        <Image 
          src="/mobil1.png" 
          alt="Premium Carwash Auto7" 
          fill
          priority
          className="object-cover" 
        />
        
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
        
        <div className="relative z-20 p-12 w-full text-left">
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

      {/* SISI KANAN: Form Login Minimalis & Elegan */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-md space-y-10">
          
          <div className="text-left">
            <Image 
              src="/auto7.png" 
              alt="Logo Auto7" 
              width={160} 
              height={50} 
              priority
              className="object-contain -ml-2 mb-4"
            />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Selamat Datang Kembali
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Silakan login ke portal SPK Logistik Auto7.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-sm font-medium"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors">
                    Lupa Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl shadow-lg shadow-red-600/20 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 uppercase tracking-wide"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses Akses...
                </span>
              ) : (
                "Masuk ke Portal"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* ==========================================
          MODAL ERROR CUSTOM (Muncul kalau login gagal)
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
      
    </div>
  );
}