"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListTodo, Truck, Calculator, History, UserCircle, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Data Kriteria", href: "/dashboard/kriteria", icon: ListTodo },
    { name: "Data Alternatif", href: "/dashboard/alternatif", icon: Truck },
    { name: "Mulai Penilaian Baru", href: "/dashboard/penilaian", icon: Calculator },
    { name: "Riwayat Keputusan", href: "/dashboard/riwayat", icon: History },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col shadow-2xl z-20 transition-all duration-300 border-r border-slate-800">
        {/* Logo/Brand */}
        <div className="h-16 flex items-center px-6 bg-black border-b border-slate-800">
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
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
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

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-black/50">
          <Link 
            href="/"
            className="flex items-center px-3 py-2.5 text-sm font-medium text-slate-400 rounded-lg hover:bg-slate-800 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">
            Sistem Pendukung Keputusan
          </div>
          
          {/* DI SINI PERUBAHANNYA: Menggunakan Link, bukan div biasa */}
          <Link 
            href="/dashboard/profil" 
            className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-slate-50 hover:shadow-sm transition-all border border-transparent hover:border-slate-100"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">Owner Auto7</p>
              <p className="text-xs text-red-600 font-bold">Administrator</p>
            </div>
            <UserCircle className="h-9 w-9 text-slate-300" />
          </Link>
          {/* AKHIR PERUBAHAN */}

        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}