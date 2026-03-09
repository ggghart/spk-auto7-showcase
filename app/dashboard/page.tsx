import Link from "next/link";
import { 
  TrendingUp, 
  Truck, 
  ListTodo, 
  History, 
  ArrowRight, 
  PlusCircle 
} from "lucide-react";

export default function DashboardHome() {
  // Data dummy (Nanti diambil dari Supabase)
  const stats = [
    { title: "Total Kriteria", value: "6", icon: ListTodo, color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Alternatif Logistik", value: "3", icon: Truck, color: "text-amber-600", bg: "bg-amber-100" },
    { title: "Total Penilaian", value: "12", icon: History, color: "text-purple-600", bg: "bg-purple-100" },
    { title: "Rekomendasi Terakhir", value: "Lalamove", icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Dashboard */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang, Owner!</h1>
        <p className="text-slate-500 text-sm mt-1">
          Berikut adalah ringkasan data Sistem Pendukung Keputusan logistik Anda hari ini.
        </p>
      </div>

      {/* Grid Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Area Bawah: Quick Actions & Riwayat Singkat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Aksi Cepat</h2>
          <div className="space-y-3 flex-1">
            <Link 
              href="/dashboard/penilaian" 
              className="w-full flex items-center justify-between p-4 rounded-lg border border-red-100 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white transition-all group"
            >
              <div className="flex items-center font-semibold">
                <PlusCircle className="h-5 w-5 mr-3" />
                Mulai Penilaian Baru
              </div>
              <ArrowRight className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
            
            <Link 
              href="/dashboard/alternatif" 
              className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-800 hover:text-white transition-all group"
            >
              <div className="flex items-center font-semibold">
                <Truck className="h-5 w-5 mr-3" />
                Kelola Jasa Logistik
              </div>
              <ArrowRight className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

        {/* Riwayat Terakhir (Preview Tabel) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">5 Penilaian Terakhir</h2>
            <Link href="/dashboard/riwayat" className="text-sm font-semibold text-red-600 hover:text-red-700">
              Lihat Semua
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-semibold">Tanggal</th>
                  <th className="pb-3 font-semibold">Keterangan</th>
                  <th className="pb-3 font-semibold">Rekomendasi (Peringkat 1)</th>
                  <th className="pb-3 font-semibold">Skor Akhir (Vi)</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="py-3">28 Feb 2026</td>
                  <td className="py-3">Pengadaan Shampo Wax Rutin</td>
                  <td className="py-3 font-bold text-red-600">Lalamove</td>
                  <td className="py-3">0.875</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-3">15 Jan 2026</td>
                  <td className="py-3">Pembelian Spons & Microfiber</td>
                  <td className="py-3 font-bold text-red-600">Deliveree</td>
                  <td className="py-3">0.820</td>
                </tr>
                <tr>
                  <td className="py-3">10 Des 2025</td>
                  <td className="py-3">Restock Bahan Kimia Cair</td>
                  <td className="py-3 font-bold text-red-600">GoBox</td>
                  <td className="py-3">0.795</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}