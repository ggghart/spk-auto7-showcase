"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Truck, 
  ListTodo, 
  History, 
  ArrowRight, 
  PlusCircle 
} from "lucide-react";
import { supabase } from "../../lib/supabase"; // Import Supabase

export default function DashboardHome() {
  // STATE NAMA USER DINAMIS
  const [namaDepan, setNamaDepan] = useState("...");

  // TARIK NAMA DARI SUPABASE
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .single();
            
          if (error) throw error;
          
          if (data && data.full_name) {
            // Ambil kata pertama (nama depan) aja biar akrab
            const namaSingkat = data.full_name.split(" ")[0];
            setNamaDepan(namaSingkat);
          }
        }
      } catch (error) {
        console.error("Gagal menarik nama user:", error);
        setNamaDepan("Pengguna");
      }
    };

    fetchUserName();
  }, []);

  // Data dummy (Nanti diambil dari Supabase)
  const stats = [
    { title: "Total Kriteria", value: "6", icon: ListTodo, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Alternatif Logistik", value: "3", icon: Truck, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Total Penilaian", value: "12", icon: History, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Rekomendasi Terakhir", value: "Lalamove", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-8">
      {/* Header Dashboard DINAMIS */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Selamat Datang, {namaDepan}!
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Berikut adalah ringkasan data Sistem Pendukung Keputusan logistik Anda hari ini.
        </p>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Area Bawah: Quick Actions & Riwayat Singkat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Aksi Cepat</h2>
          <div className="space-y-3 sm:space-y-4 flex-1">
            <Link 
              href="/dashboard/penilaian" 
              className="w-full flex items-center justify-between p-4 sm:p-5 rounded-xl border border-red-100 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-all group shadow-sm"
            >
              <div className="flex items-center font-bold text-sm sm:text-base">
                <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                Mulai Penilaian Baru
              </div>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link 
              href="/dashboard/alternatif" 
              className="w-full flex items-center justify-between p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-800 hover:text-white transition-all group shadow-sm"
            >
              <div className="flex items-center font-bold text-sm sm:text-base">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 mr-3" />
                Kelola Jasa Logistik
              </div>
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Riwayat Terakhir (Preview Tabel) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-slate-800">5 Penilaian Terakhir</h2>
            <Link href="/dashboard/riwayat" className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
              Lihat Semua
            </Link>
          </div>
          
          {/* Wrapper overflow-x-auto biar tabel ga ngerusak layout HP */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm whitespace-nowrap sm:whitespace-normal">
              <thead>
                <tr className="border-b-2 border-slate-100 text-slate-500">
                  <th className="pb-3 px-2 font-bold uppercase tracking-wider text-xs">Tanggal</th>
                  <th className="pb-3 px-2 font-bold uppercase tracking-wider text-xs min-w-[200px]">Keterangan</th>
                  <th className="pb-3 px-2 font-bold uppercase tracking-wider text-xs">Peringkat 1</th>
                  <th className="pb-3 px-2 font-bold uppercase tracking-wider text-xs text-center">Skor Akhir (Vi)</th>
                </tr>
              </thead>
              <tbody className="text-slate-700 divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2 font-medium">28 Feb 2026</td>
                  <td className="py-4 px-2 text-slate-600">Pengadaan Shampo Wax Rutin</td>
                  <td className="py-4 px-2 font-bold text-red-600">Lalamove</td>
                  <td className="py-4 px-2 text-center font-mono font-semibold text-slate-500">0.875</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2 font-medium">15 Jan 2026</td>
                  <td className="py-4 px-2 text-slate-600">Pembelian Spons & Microfiber</td>
                  <td className="py-4 px-2 font-bold text-red-600">Deliveree</td>
                  <td className="py-4 px-2 text-center font-mono font-semibold text-slate-500">0.820</td>
                </tr>
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-2 font-medium">10 Des 2025</td>
                  <td className="py-4 px-2 text-slate-600">Restock Bahan Kimia Cair</td>
                  <td className="py-4 px-2 font-bold text-red-600">GoBox</td>
                  <td className="py-4 px-2 text-center font-mono font-semibold text-slate-500">0.795</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}