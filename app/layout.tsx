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
        <div className="flex min-h-screen bg-white">
          {/* Sidebar Navigation - Light Theme */}
          <aside className="w-[220px] bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
            <Link href="/" className="mb-10">
              <h1 className="text-2xl font-bold text-gray-900">CompeteAI</h1>
              <p className="text-sm text-gray-500 mt-1">Pharma Intelligence</p>
            </Link>
            
            <nav className="space-y-1 flex-grow">
              <NavLink href="/dashboard" icon={<Activity className="w-5 h-5" />} text="Clinical Trials" active />
              <NavLink href="/companies" icon={<Building2 className="w-5 h-5" />} text="Companies" />
              <NavLink href="/news" icon={<Newspaper className="w-5 h-5" />} text="News Feed" />
              <NavLink href="/alerts" icon={<Bell className="w-5 h-5" />} text="Alerts" />
            </nav>
            
            <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-400">
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

function NavLink({ href, icon, text, active }: { href: string; icon: React.ReactNode; text: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="font-medium">{text}</span>
    </Link>
  );
}

