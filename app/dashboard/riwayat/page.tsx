"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../lib/supabase"; 
import { History, Search, Eye, Trash2, Calendar, Trophy, Download, Loader2, X, CheckCircle2, AlertTriangle } from "lucide-react";
// IMPORT LIBRARY PDF
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export default function RiwayatKeputusanPage() {
  const [riwayat, setRiwayat] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State untuk Loading Delete & Popup Modal Delete
  const [isDeleting, setIsDeleting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // State untuk Popup Modal Detail (Mata)
  const [itemToView, setItemToView] = useState<any | null>(null);

  // State BARU: Untuk Popup Konfirmasi Export PDF
  const [showExportModal, setShowExportModal] = useState(false);

  const fetchRiwayat = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("decision_history")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setRiwayat(data);
    } catch (error) {
      console.error("Gagal menarik data riwayat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  // Eksekusi hapus beneran
  const executeDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from("decision_history")
        .delete()
        .eq("id", itemToDelete);

      if (error) throw error;
      
      setRiwayat(riwayat.filter(item => item.id !== itemToDelete));
      setItemToDelete(null); // Tutup modal setelah sukses
    } catch (error) {
      console.error("Gagal menghapus riwayat:", error);
      alert("Gagal menghapus data. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatId = (id: string) => {
    if (!id) return "R-XXXX";
    return `R-${id.split("-")[0].toUpperCase()}`;
  };

  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }).format(date);
  };

  const filteredRiwayat = riwayat.filter((item) =>
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.winner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatId(item.id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ==========================================
  // FUNGSI EXPORT KE PDF SULTAN
  // ==========================================
  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Laporan Riwayat Keputusan SPK Logistik Auto7", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.text(`Dicetak pada: ${today}`, 14, 28);
    doc.text(`Total Data: ${filteredRiwayat.length} Keputusan`, 14, 34);

    const tableColumn = ["ID", "Tanggal", "Keterangan Penilaian", "Rekomendasi Utama", "Skor (Vi)", "Status CR"];
    const tableRows: any[] = [];

    filteredRiwayat.forEach(item => {
      const rowData = [
        formatId(item.id),
        formatTanggal(item.created_at),
        item.description || "Tanpa Judul",
        item.winner_name,
        Number(item.final_score).toFixed(4),
        item.cr_status
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
      headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }, 
    });

    doc.save("Laporan_Riwayat_SPK_Auto7.pdf");
    
    // Tutup popup setelah sukses download
    setShowExportModal(false);
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <History className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat Keputusan</h1>
            <p className="text-slate-500 text-sm mt-1">
              Arsip hasil perhitungan AHP dan TOPSIS.
            </p>
          </div>
        </div>
        
        {/* TOMBOL EXPORT SEKARANG BUKA POPUP */}
        <button 
          onClick={() => setShowExportModal(true)}
          className="flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Laporan (.pdf)
        </button>
      </div>

      {/* Kontainer Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 gap-4">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-sm transition-all bg-white font-medium"
              placeholder="Cari ID, keterangan, atau rekomendasi..."
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total: <span className="text-slate-800 font-bold">{filteredRiwayat.length}</span> Keputusan
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
              <p className="font-medium text-sm">Menarik data dari database...</p>
            </div>
          ) : filteredRiwayat.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <History className="w-12 h-12 text-slate-200 mb-4" />
              <p className="font-bold text-slate-600">Riwayat Kosong</p>
              <p className="text-sm">Belum ada data atau kata kunci tidak ditemukan.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">ID & Tanggal</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs w-1/3">Keterangan Sesi Penilaian</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Rekomendasi Utama</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Skor (Vi)</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRiwayat.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{formatId(item.id)}</div>
                      <div className="text-slate-500 text-xs mt-1 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> {formatTanggal(item.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium truncate max-w-[200px] sm:max-w-xs">
                      {item.description || "Tanpa Judul"} 
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                        <Trophy className="w-4 h-4 mr-2 text-emerald-500" />
                        {item.winner_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                        {Number(item.final_score).toFixed(4)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => setItemToView(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Lihat Detail Keputusan"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => setItemToDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
                          title="Hapus Riwayat"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ==========================================
          MODAL KONFIRMASI EXPORT PDF (BARU)
          ========================================== */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 relative">
            <button 
              onClick={() => setShowExportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-4 mt-2 border border-blue-100">
              <Download className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Unduh Laporan?</h3>
            <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">
              Sistem akan menghasilkan file PDF berdasarkan <strong className="text-slate-700">{filteredRiwayat.length}</strong> data riwayat yang sedang ditampilkan. Lanjutkan?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={exportToPDF}
                className="flex-1 flex justify-center items-center py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-md shadow-blue-600/20"
              >
                Ya, Unduh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL DETAIL KEPUTUSAN
          ========================================== */}
      {itemToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 relative">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                Rincian Keputusan SPK
              </h3>
              <button 
                onClick={() => setItemToView(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">ID Referensi</p>
                  <p className="font-mono font-bold text-slate-800 mt-1">{formatId(itemToView.id)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Dibuat</p>
                  <p className="font-medium text-slate-800 mt-1 flex items-center justify-end">
                    <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                    {formatTanggal(itemToView.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Keterangan / Judul Penilaian</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 font-medium leading-relaxed">
                  {itemToView.description || "Tanpa Judul"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Peringkat #1</p>
                  <p className="text-xl font-bold text-emerald-700 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-emerald-500" />
                    {itemToView.winner_name}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Skor Akhir (Vi)</p>
                  <p className="text-xl font-bold text-blue-700 font-mono">
                    {Number(itemToView.final_score).toFixed(4)}
                  </p>
                </div>
              </div>

              <div>
                 <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Validasi AHP (Consistency Ratio)</p>
                 <div className={`inline-flex items-center px-4 py-2 rounded-xl border font-bold text-sm ${
                   itemToView.cr_status === 'Konsisten' || itemToView.cr_status === 'success' 
                   ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                   : 'bg-amber-50 border-amber-200 text-amber-700'
                 }`}>
                   {itemToView.cr_status === 'Konsisten' || itemToView.cr_status === 'success' 
                    ? <CheckCircle2 className="w-5 h-5 mr-2" /> 
                    : <AlertTriangle className="w-5 h-5 mr-2" />}
                   {itemToView.cr_status}
                 </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed text-center">
                  <p className="text-xs font-medium text-slate-500">
                    Log detail angka matriks hitungan belum dicatat di database untuk versi ini.
                  </p>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setItemToView(null)}
                className="px-6 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
              >
                Tutup Modal
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          MODAL KONFIRMASI HAPUS CUSTOM
          ========================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 relative">
            <button 
              onClick={() => !isDeleting && setItemToDelete(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition-colors disabled:opacity-50"
              disabled={isDeleting}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4 mt-2 border border-red-100">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Riwayat?</h3>
            <p className="text-sm text-slate-500 mb-8 px-2 leading-relaxed">
              Apakah Anda yakin ingin menghapus data ini secara permanen? Data yang sudah dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-70"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="flex-1 flex justify-center items-center py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70"
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