"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Wallet, BarChart2, User } from "lucide-react"
import SupportChat from "@/components/SupportChat"

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
  { icon: BarChart2, label: "Market", href: "/dashboard/markets" },
  { icon: User, label: "Profile", href: "/dashboard/profile" },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex w-64 bg-background border-r border-accent flex-col">
        <div className="p-4 flex gap-2 items-center">
          <img src="/Logo.jpeg" alt="Crexsim Logo" className="w-12 h-12" />
          <h1 className="tracking-wide font-bold text-3xl">CREXSIM</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 p-2 rounded hover:bg-accent ${
                pathname === item.href ? "bg-accent text-accent-foreground" : ""
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>

      {/* Bottom navigation for mobile */}
      <nav className="md:hidden bg-background border-t border-accent flex justify-around p-2 fixed bottom-0 left-0 right-0">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center p-2 ${pathname === item.href ? "text-primary" : ""}`}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Support Chat Component */}
      <SupportChat />
    </div>
  )
}

