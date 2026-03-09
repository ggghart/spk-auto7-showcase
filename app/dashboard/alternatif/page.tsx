"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Truck, CheckCircle2, XCircle, Loader2, X, Save, AlertTriangle } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface Alternatif {
  id: string;
  name: string;
  description: string;
  status: string;
}

export default function DataAlternatifPage() {
  const [alternatif, setAlternatif] = useState<Alternatif[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ==========================================
  // STATE MODAL FORM (Tambah & Edit)
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    status: "Aktif"
  });

  // ==========================================
  // STATE MODAL HAPUS
  // ==========================================
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [alternatifToDelete, setAlternatifToDelete] = useState<{id: string, name: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ==========================================
  // FUNGSI TARIK DATA (READ)
  // ==========================================
  const fetchAlternatif = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("alternatives")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      if (data) setAlternatif(data);
    } catch (error: any) {
      console.error("Gagal menarik data alternatif:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlternatif();
  }, []);

  // ==========================================
  // HANDLER BUKA MODAL
  // ==========================================
  const handleKlikTambah = () => {
    setIsEditMode(false);
    setFormData({ id: "", name: "", description: "", status: "Aktif" });
    setIsModalOpen(true);
  };

  const handleKlikEdit = (item: Alternatif) => {
    setIsEditMode(true);
    // Isi form sesuai data yang mau diedit
    setFormData({ 
      id: item.id, 
      name: item.name, 
      description: item.description || "", 
      status: item.status 
    });
    setIsModalOpen(true);
  };

  // ==========================================
  // FUNGSI SUBMIT (CREATE & UPDATE)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id || !formData.name) {
      alert("Kode dan Nama Jasa Logistik wajib diisi!");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditMode) {
        // UPDATE DATA LAMA
        const { error } = await supabase
          .from("alternatives")
          .update({ 
            name: formData.name, 
            description: formData.description,
            status: formData.status
          })
          .eq("id", formData.id);

        if (error) throw error;
      } else {
        // INSERT DATA BARU
        const { error } = await supabase
          .from("alternatives")
          .insert([
            { 
              id: formData.id.toUpperCase(), 
              name: formData.name, 
              description: formData.description,
              status: formData.status 
            }
          ]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      setFormData({ id: "", name: "", description: "", status: "Aktif" });
      fetchAlternatif(); 
      
    } catch (error: any) {
      alert(`Gagal ${isEditMode ? 'mengedit' : 'menambah'} data: ` + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // FUNGSI HAPUS DATA (DELETE)
  // ==========================================
  const handleKlikHapus = (id: string, name: string) => {
    setAlternatifToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const executeHapus = async () => {
    if (!alternatifToDelete) return;
    try {
      setIsDeleting(true); 
      const { error } = await supabase.from("alternatives").delete().eq("id", alternatifToDelete.id);
      if (error) throw error;

      setIsDeleteModalOpen(false);
      setAlternatifToDelete(null);
      fetchAlternatif();
    } catch (error: any) {
      alert("Gagal menghapus data: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <Truck className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Data Alternatif</h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola daftar penyedia jasa logistik yang akan dievaluasi.
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleKlikTambah}
          className="flex items-center justify-center px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all shadow-md shadow-red-600/20"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Alternatif
        </button>
      </div>

      {/* Kontainer Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar Tabel */}
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-sm transition-all bg-white"
              placeholder="Cari nama jasa logistik..."
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total: {alternatif.length} Data
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs w-20">Kode</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Nama Penyedia Jasa</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs w-1/3">Keterangan / Layanan</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs w-40 text-center">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                      <p className="font-medium animate-pulse">Memproses data database...</p>
                    </div>
                  </td>
                </tr>
              ) : alternatif.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500 font-medium">
                    Belum ada data alternatif yang ditambahkan.
                  </td>
                </tr>
              ) : (
                alternatif.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{item.id}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                        item.status === "Aktif" 
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {item.status === "Aktif" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        
                        {/* TOMBOL EDIT */}
                        <button 
                          onClick={() => handleKlikEdit(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        
                        {/* TOMBOL HAPUS */}
                        <button 
                          onClick={() => handleKlikHapus(item.id, item.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Hapus"
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

      {/* ==========================================
          MODAL FORM TAMBAH / EDIT
          ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg flex items-center">
                {isEditMode ? <Edit2 className="w-5 h-5 mr-2 text-blue-600" /> : <Plus className="w-5 h-5 mr-2 text-red-600" />}
                {isEditMode ? "Edit Jasa Logistik" : "Tambah Alternatif Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Kode Alternatif</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.id} 
                    onChange={(e) => setFormData({...formData, id: e.target.value})} 
                    disabled={isEditMode}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-slate-800 font-medium disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed" 
                    placeholder="Contoh: A4" 
                  />
                  {isEditMode && <p className="text-xs text-slate-500 mt-1">Kode alternatif tidak dapat diubah.</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Penyedia Jasa</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-slate-800 font-medium" 
                    placeholder="Contoh: Maxim Cargo" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Keterangan / Layanan</label>
                  <input 
                    type="text" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-slate-800 font-medium" 
                    placeholder="Contoh: Pick-up Terbuka" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})} 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-600 outline-none text-slate-800 font-medium bg-white"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>
              
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isSubmitting} className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-colors disabled:opacity-70 flex items-center ${isEditMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> {isEditMode ? "Simpan Perubahan" : "Simpan Data"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL HAPUS DATA
          ========================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Alternatif?</h3>
            <p className="text-sm text-slate-500 mb-8 px-2">
              Apakah Anda yakin ingin menghapus jasa <br/> 
              <span className="font-bold text-slate-800">{alternatifToDelete?.id} - {alternatifToDelete?.name}</span>? <br/>
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setAlternatifToDelete(null); }}
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
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}