"use client";

import { useState } from "react";
import { History, Search, Eye, Trash2, Calendar, Trophy, Download } from "lucide-react";

export default function RiwayatKeputusanPage() {
  // Data dummy Riwayat Penilaian
  const [riwayat] = useState([
    { 
      id: "R-104", 
      tanggal: "04 Mar 2026", 
      keterangan: "Pengadaan Material Detailing Bulanan", 
      pemenang: "Lalamove", 
      skor: "0.854",
      status_cr: "Konsisten (0.04)"
    },
    { 
      id: "R-103", 
      tanggal: "20 Feb 2026", 
      keterangan: "Distribusi Shampo Wax ke Cabang", 
      pemenang: "Deliveree", 
      skor: "0.821",
      status_cr: "Konsisten (0.06)"
    },
    { 
      id: "R-102", 
      tanggal: "15 Jan 2026", 
      keterangan: "Restock Spons & Microfiber", 
      pemenang: "GoBox", 
      skor: "0.790",
      status_cr: "Konsisten (0.09)"
    },
  ]);

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <History className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Riwayat Keputusan</h1>
            <p className="text-slate-500 text-sm mt-1">
              Arsip hasil perhitungan AHP dan TOPSIS yang telah disimpan.
            </p>
          </div>
        </div>
        
        <button className="flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-md">
          <Download className="h-4 w-4 mr-2" />
          Export Laporan (.pdf)
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
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none text-sm transition-all bg-white font-medium"
              placeholder="Cari keterangan atau tanggal..."
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total: {riwayat.length} Keputusan
          </div>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
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
              {riwayat.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.id}</div>
                    <div className="text-slate-500 text-xs mt-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" /> {item.tanggal}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {item.keterangan}
                  </td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                      <Trophy className="w-4 h-4 mr-2 text-emerald-500" />
                      {item.pemenang}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-slate-800">{item.skor}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Lihat Detail Matriks">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Hapus Riwayat">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
      
    </div>
  );
}