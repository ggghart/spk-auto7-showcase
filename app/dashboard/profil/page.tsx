"use client";

import { useState, useEffect } from "react";
import { 
  UserCircle, ShieldCheck, Key, Plus, Trash2, Mail, Briefcase, 
  User, Loader2, X, AlertTriangle, KeySquare, CheckCircle2, AlertCircle, Lock
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface ProfilPegawai {
  id: string;
  full_name: string;
  username: string;
  role: string;
}

export default function ProfilPage() {
  // STATE DINAMIS UNTUK USER YANG SEDANG LOGIN
  const [currentUserRole, setCurrentUserRole] = useState<"Owner" | "Employee" | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [currentFullName, setCurrentFullName] = useState<string>(""); // STATE BARU BUAT NAMA ASLI

  // State Data Pegawai
  const [pegawai, setPegawai] = useState<ProfilPegawai[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State Permintaan Reset Password 
  const [resetRequests, setResetRequests] = useState<any[]>([]);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  // STATE: MODAL KONFIRMASI RESET & SUKSES
  const [resetToApprove, setResetToApprove] = useState<{id: string, username: string} | null>(null);
  const [successAlert, setSuccessAlert] = useState<{title: string, message: string} | null>(null);

  // STATE BARU: MODAL GANTI PASSWORD SENDIRI
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // State Modal Tambah Akun
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    password: "", 
  });

  // State Modal Hapus
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [pegawaiToDelete, setPegawaiToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==========================================
  // FUNGSI CEK SESI LOGIN (RBAC)
  // ==========================================
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          // SEKARANG KITA TARIK JUGA full_name DARI DATABASE
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, username, full_name")
            .eq("id", session.user.id)
            .single();

          if (profileError) throw profileError;

          if (profile) {
            setCurrentUserRole(profile.role);
            setCurrentUsername(profile.username);
            setCurrentFullName(profile.full_name); // SIMPAN NAMA ASLINYA DISINI
          }
        }
      } catch (error) {
        console.error("Gagal memuat sesi:", error);
      }
    };

    checkUserSession();
  }, []);

  // ==========================================
  // FUNGSI TARIK DATA PEGAWAI & REQUEST RESET
  // ==========================================
  const fetchPegawai = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "Employee")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setPegawai(data);
    } catch (error: any) {
      console.error("Gagal menarik data pegawai:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResetRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("password_reset_requests")
        .select("*")
        .eq("status", "Pending")
        .order("requested_at", { ascending: false });

      if (error) throw error;
      if (data) setResetRequests(data);
    } catch (error) {
      console.error("Gagal menarik data reset password:", error);
    }
  };

  useEffect(() => {
    if (currentUserRole === "Owner") {
      fetchPegawai();
      fetchResetRequests();
    }
  }, [currentUserRole]);

  // ==========================================
  // FUNGSI EKSEKUSI RESET OLEH OWNER
  // ==========================================
  const executeApproveReset = async () => {
    if (!resetToApprove) return;

    try {
      setIsProcessingId(resetToApprove.id);

      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: resetToApprove.id,
          username: resetToApprove.username,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Gagal mereset password di sistem utama.");
      }

      setResetRequests(resetRequests.filter(req => req.id !== resetToApprove.id));
      setSuccessAlert({
        title: "Sistem Inti Ditembus!",
        message: `Password untuk akun ${resetToApprove.username} telah diperbarui langsung di database Supabase. Silakan suruh ${resetToApprove.username} untuk login menggunakan password default: Auto7Karyawan!`
      });
      setResetToApprove(null); 

    } catch (error: any) {
      console.error("Gagal memproses reset:", error);
      alert(error.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  // ==========================================
  // FUNGSI GANTI PASSWORD SENDIRI
  // ==========================================
  const handleUpdateMyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal 6 karakter bro!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok! Coba ketik ulang.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setIsChangePasswordOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setSuccessAlert({
        title: "Password Berhasil Diganti!",
        message: "Password akun Anda telah sukses diperbarui. Gunakan password baru ini saat login berikutnya."
      });

    } catch (error: any) {
      console.error("Gagal ganti password:", error);
      setPasswordError(error.message || "Gagal memperbarui password. Pastikan koneksi aman.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // ==========================================
  // FUNGSI TAMBAH AKUN (CREATE + AUTH)
  // ==========================================
  const handleTambahSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.username || !formData.password) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password minimal 6 karakter bro!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const dummyEmail = `${formData.username}@auto7.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dummyEmail,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert([
            {
              id: authData.user.id,
              full_name: formData.full_name,
              username: formData.username,
              role: "Employee"
            }
          ]);

        if (profileError) throw profileError;
      }

      setIsModalOpen(false);
      setFormData({ full_name: "", username: "", password: "" });
      fetchPegawai();

    } catch (error: any) {
      alert("Gagal membuat akun: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // FUNGSI HAPUS AKUN (DELETE)
  // ==========================================
  const executeHapus = async () => {
    if (!pegawaiToDelete) return;
    try {
      setIsDeleting(true); 
      const { error } = await supabase.from("profiles").delete().eq("id", pegawaiToDelete.id);
      if (error) throw error;

      setIsDeleteModalOpen(false);
      setPegawaiToDelete(null);
      fetchPegawai();
    } catch (error: any) {
      alert("Gagal menghapus data: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUserRole) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* =========================================
          PROFIL PRIBADI
          ========================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-900 to-red-900 relative">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-8 sm:-mt-10 mb-6 gap-4">
            <div className="flex items-end space-x-5">
              <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
                <div className="bg-slate-100 p-4 rounded-xl text-slate-400">
                  <UserCircle className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
              </div>
              <div className="pb-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                  {/* SEKARANG NAMPILIN NAMA ASLINYA BRO */}
                  {currentFullName || (currentUserRole === "Owner" ? "Owner Auto7" : "Staff Auto7")}
                </h1>
                <div className="flex items-center mt-1 space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    currentUserRole === "Owner" 
                      ? "bg-red-100 text-red-700 border border-red-200" 
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}>
                    {currentUserRole === "Owner" ? <ShieldCheck className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                    {currentUserRole === "Owner" ? "Administrator Utama" : "Staff Operasional"}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200 flex items-center justify-center"
            >
              <Key className="w-4 h-4 mr-2" /> Ganti Password Saya
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username Login</p>
              <p className="text-slate-800 font-semibold flex items-center">
                <Mail className="w-4 h-4 mr-2 text-slate-400" /> 
                {currentUsername || "Memuat..."}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Divisi / Jabatan</p>
              <p className="text-slate-800 font-semibold flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-slate-400" /> 
                {currentUserRole === "Owner" ? "Manajemen Pusat" : "Operasional Logistik"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          FITUR KHUSUS OWNER
          ========================================= */}
      {currentUserRole === "Owner" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* 1. PANEL PERMINTAAN RESET PASSWORD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 flex items-center">
                  <KeySquare className="w-5 h-5 mr-2 text-blue-600" />
                  Permintaan Reset Password
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Daftar pegawai yang lupa kata sandi dan meminta bantuan Anda.
                </p>
              </div>
              <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-lg text-sm flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2"></span>
                {resetRequests.length} Pending
              </div>
            </div>

            <div className="p-6 flex-1">
              {resetRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                  <p className="font-bold text-slate-600">Semua Aman!</p>
                  <p className="text-sm mt-1">Tidak ada permintaan reset password saat ini.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resetRequests.map((req) => (
                    <div key={req.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-blue-200 transition-colors gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm">
                          <AlertCircle className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            Username: <span className="text-blue-600">{req.username}</span>
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center">
                            Diminta pada: {new Date(req.requested_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setResetToApprove({ id: req.id, username: req.username })}
                        disabled={isProcessingId === req.id}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-70 shadow-md"
                      >
                        {isProcessingId === req.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                        ) : (
                          <><Key className="w-4 h-4 mr-2" /> Setujui & Reset</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. PANEL MANAJEMEN PEGAWAI */}
          <div>
            <div className="flex items-center justify-between mb-4 px-2">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Manajemen Akun Pegawai</h2>
                <p className="text-slate-500 text-sm mt-1">Kelola akses staff untuk menggunakan sistem SPK.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-600/20 text-sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Tambah Akun
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Nama Pegawai</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Username</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Jabatan</th>
                      <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center w-48">Aksi Administrator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                              <p className="font-medium animate-pulse">Memuat data pegawai...</p>
                            </div>
                          </td>
                        </tr>
                    ) : pegawai.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">
                          Belum ada akun pegawai yang didaftarkan.
                        </td>
                      </tr>
                    ) : (
                      pegawai.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{item.full_name}</div>
                            <div className="text-slate-400 text-xs mt-0.5" title={item.id}>
                              ID: {item.id.substring(0, 8)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600">
                            {item.username}
                          </td>
                          <td className="px-6 py-4 text-slate-600">
                            <span className="inline-flex items-center px-2 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                              Staff Logistik
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center space-x-2">
                              <button 
                                onClick={() => {
                                  setPegawaiToDelete({ id: item.id, name: item.full_name });
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                                title="Hapus Akun"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL GANTI PASSWORD SENDIRI
          ========================================== */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center">
                <Key className="w-5 h-5 mr-2 text-slate-600" />
                Ganti Password Baru
              </h3>
              <button 
                onClick={() => setIsChangePasswordOpen(false)} 
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateMyPassword}>
              <div className="p-6 space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      required 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-600 outline-none text-slate-800 font-medium" 
                      placeholder="Minimal 6 karakter" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="password" 
                      required 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-600 outline-none text-slate-800 font-medium" 
                      placeholder="Ketik ulang password baru" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsChangePasswordOpen(false)} 
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdatingPassword} 
                  className="px-5 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-70 flex items-center shadow-md"
                >
                  {isUpdatingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memperbarui...</> : "Simpan Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL KONFIRMASI RESET OLEH OWNER
          ========================================== */}
      {resetToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 relative">
            <button 
              onClick={() => !isProcessingId && setResetToApprove(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors disabled:opacity-50"
              disabled={isProcessingId !== null}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4 mt-2 border border-slate-200 shadow-inner">
              <Key className="h-8 w-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Setujui Reset Password?</h3>
            <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">
              Anda akan menyetujui reset password untuk akun <strong className="text-slate-800">{resetToApprove.username}</strong>. Lanjutkan proses ini?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setResetToApprove(null)}
                disabled={isProcessingId !== null}
                className="flex-1 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-70"
              >
                Batal
              </button>
              <button
                onClick={executeApproveReset}
                disabled={isProcessingId !== null}
                className="flex-1 flex justify-center items-center py-3 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-70"
              >
                {isProcessingId === resetToApprove.id ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya, Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL SUKSES (DIPAKAI BERSAMA)
          ========================================== */}
      {successAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 relative">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-50 mb-4 mt-2 border border-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{successAlert.title}</h3>
            <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">
              {successAlert.message}
            </p>
            <button
              onClick={() => setSuccessAlert(null)}
              className="w-full py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Tutup Pesan
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL TAMBAH AKUN PEGAWAI
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-red-600" />
                Daftarkan Akun Pegawai
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleTambahSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-slate-800 font-medium" 
                    placeholder="Contoh: Budi Santoso" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Username Login</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})} 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-slate-800 font-medium" 
                    placeholder="Contoh: budi.admin" 
                  />
                  <p className="text-[10px] text-slate-500 mt-1">*Otomatis diubah menjadi huruf kecil tanpa spasi.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password Akun</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-slate-800 font-medium" 
                    placeholder="Minimal 6 karakter" 
                  />
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70 flex items-center">
                  {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mendaftarkan...</> : "Buat Akun Pegawai"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL HAPUS PEGAWAI
          ========================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Akun Pegawai?</h3>
            <p className="text-sm text-slate-500 mb-8 px-2">
              Apakah Anda yakin ingin menghapus akses untuk <br/> 
              <span className="font-bold text-slate-800">{pegawaiToDelete?.name}</span>?
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setPegawaiToDelete(null); }}
                className="flex-1 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                disabled={isDeleting}
              >
                Batal
              </button>
              <button
                onClick={executeHapus}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya, Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}