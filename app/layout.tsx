import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Activity, Building2, Newspaper, Bell, LayoutDashboard } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CompeteAI - Pharma CI Dashboard",
  description: "Real-time pharmaceutical competitive intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gray-50">
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col shadow-lg">
            <Link href="/" className="mb-10">
              <h1 className="text-3xl font-bold text-blue-400">CompeteAI</h1>
              <p className="text-xs text-slate-400 mt-1">Pharma Intelligence</p>
            </Link>
            
            <nav className="space-y-2 flex-grow">
              <NavLink href="/dashboard" icon={<Activity className="w-5 h-5" />} text="Clinical Trials" />
              <NavLink href="/companies" icon={<Building2 className="w-5 h-5" />} text="Companies" />
              <NavLink href="/news" icon={<Newspaper className="w-5 h-5" />} text="News Feed" />
              <NavLink href="/alerts" icon={<Bell className="w-5 h-5" />} text="Alerts" />
            </nav>
            
            <div className="mt-8 pt-4 border-t border-slate-700 text-sm text-slate-500">
              <p>&copy; 2026 CompeteAI</p>
              <p className="text-xs mt-1">DelveInsight</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) {
  return (
    <Link
      href={href}
      className="flex items-center space-x-3 text-slate-300 hover:text-white hover:bg-slate-800 p-3 rounded-lg transition-colors duration-200"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

