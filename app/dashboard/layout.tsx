"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  ListTodo, 
  Truck, 
  Calculator, 
  History, 
  UserCircle, 
  LogOut, 
  Menu, 
  X,
  Loader2 // Tambahan ikon loading
} from "lucide-react";
import { supabase } from "../../lib/supabase"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk Menu Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // STATE UNTUK PROFIL HEADER DINAMIS
  const [namaUser, setNamaUser] = useState("Memuat...");
  const [roleUser, setRoleUser] = useState("");

  // STATE UNTUK MODAL LOGOUT
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // FUNGSI TARIK DATA PROFIL USER YANG LOGIN
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", session.user.id)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setNamaUser(data.full_name);
            setRoleUser(data.role);
          }
        }
      } catch (error) {
        console.error("Gagal menarik profil untuk header:", error);
        setNamaUser("Pengguna");
      }
    };

    fetchUserProfile();
  }, []);

  // FUNGSI EKSEKUSI LOGOUT BENERAN
  const executeLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/"); 
    } catch (error) {
      console.error("Gagal logout:", error);
    } finally {
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Data Kriteria", href: "/dashboard/kriteria", icon: ListTodo },
    { name: "Data Alternatif", href: "/dashboard/alternatif", icon: Truck },
    { name: "Mulai Penilaian Baru", href: "/dashboard/penilaian", icon: Calculator },
    { name: "Riwayat Keputusan", href: "/dashboard/riwayat", icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans overflow-hidden">
      
      {/* OVERLAY GELAP UNTUK MOBILE */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed md:relative w-64 h-full bg-slate-950 text-white flex flex-col shadow-2xl z-30 transition-transform duration-300 border-r border-slate-800 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        
        {/* Logo/Brand & Tombol Tutup Mobile */}
        <div className="h-16 flex items-center justify-between px-6 bg-black border-b border-slate-800">
          <Link href="/dashboard" className="block">
            <Image 
              src="/auto7.png" 
              alt="Logo Auto7" 
              width={120} 
              height={40} 
              priority
              className="object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar">
          <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Menu Utama
          </p>
          
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all group ${
                  isActive 
                    ? "bg-red-600 text-white shadow-md shadow-red-900/30" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 ${isActive ? "text-white" : "group-hover:text-red-400 transition-colors"}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar (Tombol Logout Manggil Modal) */}
        <div className="p-4 border-t border-slate-800 bg-black/50">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* ==========================================
            HEADER FLOATING PILL (Khusus Mobile)
            ========================================== */}
        <header className="h-14 sm:h-16 mt-3 mx-3 sm:mt-0 sm:mx-0 bg-white/80 sm:bg-white backdrop-blur-xl sm:backdrop-blur-none border border-slate-200/60 sm:border-slate-200 sm:border-x-0 sm:border-t-0 flex items-center justify-between px-4 sm:px-8 z-10 shadow-sm rounded-2xl sm:rounded-none transition-all">
          
          <div className="flex items-center">
            <button
              className="mr-3 p-1.5 md:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl focus:outline-none transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5 sm:h-6 w-6" />
            </button>
            
            {/* Teks Judul Premium */}
            <div className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-widest hidden sm:block">
              Portal Logistik Auto7 Carwash
            </div>
            <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest sm:hidden">
              Portal Logistik Auto7
            </div>
          </div>
          
          {/* HEADER PROFIL DINAMIS */}
          <Link 
            href="/dashboard/profil" 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer p-1.5 sm:p-2 rounded-xl hover:bg-white sm:hover:bg-slate-50 hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">
                {namaUser}
              </p>
              <p className={`text-xs font-bold ${roleUser === "Owner" ? "text-red-600" : "text-blue-600"}`}>
                {roleUser === "Owner" ? "Administrator" : "Staff Logistik"}
              </p>
            </div>
            <UserCircle className="h-7 w-7 sm:h-9 sm:w-9 text-slate-300" />
          </Link>

        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>

      {/* ==========================================
          MODAL LOGOUT CUSTOM
          ========================================== */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 text-center p-6 relative">
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <LogOut className="h-8 w-8 text-red-600 pr-1" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-2">Keluar Sistem?</h3>
            <p className="text-sm text-slate-500 mb-8 px-2">
              Apakah Anda yakin ingin mengakhiri sesi dan keluar dari portal SPK Auto7?
            </p>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                disabled={isLoggingOut}
              >
                Batal
              </button>
              <button
                onClick={executeLogout}
                disabled={isLoggingOut}
                className="flex-1 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center"
              >
                {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ya, Keluar"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}