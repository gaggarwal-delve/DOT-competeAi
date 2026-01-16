import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Activity, Building2, Newspaper, Bell } from "lucide-react";
import AskCompeteAI from "@/components/AskCompeteAI";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CompeteAI - Pharma CI Dashboard",
  description: "Real-time pharmaceutical competitive intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Full-Width Top Header - Above Everything */}
        <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-gray-900">CompeteAI</h1>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">V2</span>
              <span className="text-sm text-gray-600">Pharmaceutical Competitive Intelligence</span>
            </div>
            <nav className="flex gap-6">
              <Link href="/companies" className="text-sm font-medium text-gray-700 hover:text-[#4169E1] transition-colors">
                Companies
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-[#4169E1] transition-colors">
                All Trials
              </Link>
              <Link href="/news" className="text-sm font-medium text-gray-700 hover:text-[#4169E1] transition-colors">
                News
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex pt-[73px]">
          {/* Sidebar Navigation - Light Theme */}
          <aside className="w-[220px] bg-gray-50 border-r border-gray-200 p-6 flex flex-col fixed left-0 top-[73px] bottom-0">
            <Link href="/" className="mb-8">
              <p className="text-sm text-gray-500">Pharma Intelligence</p>
            </Link>
            
            <nav className="space-y-1 flex-grow">
              <NavLink href="/" icon={<Activity className="w-5 h-5" />} text="Clinical Trials" active />
              <NavLink href="/companies" icon={<Building2 className="w-5 h-5" />} text="Companies" />
              <NavLink href="/news" icon={<Newspaper className="w-5 h-5" />} text="News Feed" />
              <NavLink href="/alerts" icon={<Bell className="w-5 h-5" />} text="Alerts" />
            </nav>
            
            {/* Ask CompeteAI Component */}
            <div className="mt-6 mb-6">
              <AskCompeteAI />
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-200 text-sm text-gray-400">
              <p>&copy; 2026 CompeteAI</p>
              <p className="text-xs mt-1">DelveInsight</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 ml-[220px] bg-[#FAFBFC] min-h-screen">
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
      className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        active
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
      style={active ? { boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)' } : undefined}
    >
      {icon}
      <span className="font-medium text-sm">{text}</span>
    </Link>
  );
}
