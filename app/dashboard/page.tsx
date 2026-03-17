"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Truck, 
  ListTodo, 
  History, 
  ArrowRight, 
  PlusCircle,
  Loader2,
  Calendar,
  Activity,
  Trophy,
  LayoutDashboard,
  Clock
} from "lucide-react";
import { supabase } from "../../lib/supabase"; 

export default function DashboardHome() {
  // STATE DATA DINAMIS
  const [namaDepan, setNamaDepan] = useState("...");
  const [riwayatTerbaru, setRiwayatTerbaru] = useState<any[]>([]);
  const [totalPenilaian, setTotalPenilaian] = useState(0);
  const [rekomendasiTerakhir, setRekomendasiTerakhir] = useState("-");
  
  // STATE KRITERIA & ALTERNATIF
  const [totalKriteria, setTotalKriteria] = useState(0);
  const [totalAlternatif, setTotalAlternatif] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // TARIK SEMUA DATA DARI SUPABASE
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Tarik Nama User
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .single();
            
          if (profile?.full_name) {
            setNamaDepan(profile.full_name.split(" ")[0]);
          }
        }

        // 2. Tarik Total Penilaian
        const { count: countPenilaian } = await supabase
          .from("decision_history")
          .select("*", { count: "exact", head: true });
        
        setTotalPenilaian(countPenilaian || 0);

        // 3. Tarik 5 Riwayat Terakhir
        const { data: recentData } = await supabase
          .from("decision_history")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (recentData && recentData.length > 0) {
          setRiwayatTerbaru(recentData);
          setRekomendasiTerakhir(recentData[0].winner_name); 
        }

        // 4. Tarik Kriteria DARI TABEL criteria (BAHASA INGGRIS)
        const { count: countKriteria, error: errKriteria } = await supabase
          .from("criteria")
          .select("*", { count: "exact", head: true });
        
        if (errKriteria) {
          console.error("Error kriteria:", errKriteria);
          setTotalKriteria(0);
        } else {
          setTotalKriteria(countKriteria || 0);
        }

        // 5. Tarik Alternatif DARI TABEL alternatives (BAHASA INGGRIS)
        const { count: countAlternatif, error: errAlternatif } = await supabase
          .from("alternatives")
          .select("*", { count: "exact", head: true });
        
        if (errAlternatif) {
          console.error("Error alternatif:", errAlternatif);
          setTotalAlternatif(0);
        } else {
          setTotalAlternatif(countAlternatif || 0);
        }

      } catch (error) {
        console.error("Gagal menarik data dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatTanggal = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    }).format(date);
  };

  const formatId = (id: string) => {
    if (!id) return "R-XXXX";
    return `R-${id.split("-")[0].toUpperCase()}`;
  };

  const stats = [
    { title: "Total Kriteria", value: isLoading ? "..." : totalKriteria.toString(), icon: ListTodo, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Alternatif Logistik", value: isLoading ? "..." : totalAlternatif.toString(), icon: Truck, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Total Keputusan", value: isLoading ? "..." : totalPenilaian.toString(), icon: History, color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Terbaik Terakhir", value: isLoading ? "..." : rekomendasiTerakhir, icon: Trophy, color: "text-red-600", bg: "bg-red-100" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight flex items-center">
          <LayoutDashboard className="w-8 h-8 mr-3 text-red-600" />
          Selamat Datang, {namaDepan}!
        </h1>
        <p className="text-slate-500 text-sm sm:text-base mt-2">
          Pantau ringkasan performa dan aktivitas Sistem Pendukung Keputusan Logistik Auto7.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4 relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <Loader2 className={`w-5 h-5 animate-spin ${stat.color}`} />
                </div>
              )}
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <Icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color}`} />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1 truncate" title={stat.value}>
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
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

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-bold text-slate-800">5 Penilaian Terakhir</h2>
            <Link href="/dashboard/riwayat" className="text-sm font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
              Lihat Semua
            </Link>
          </div>
          
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
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center">
                      <Loader2 className="w-6 h-6 animate-spin text-red-500 mx-auto mb-2" />
                      <p className="text-slate-400 text-sm mt-2">Menarik data dari database...</p>
                    </td>
                  </tr>
                ) : riwayatTerbaru.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center">
                      <p className="text-slate-500 font-medium">Belum ada riwayat penilaian.</p>
                    </td>
                  </tr>
                ) : (
                  riwayatTerbaru.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-2 font-medium">{formatTanggal(item.created_at)}</td>
                      <td className="py-4 px-2 text-slate-600 truncate max-w-[150px] sm:max-w-xs" title={item.description}>
                        {item.description || "Tanpa Judul"}
                      </td>
                      <td className="py-4 px-2 font-bold text-red-600">{item.winner_name}</td>
                      <td className="py-4 px-2 text-center font-mono font-semibold text-slate-500">
                        {Number(item.final_score).toFixed(4)}
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
  );
}