"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Car,
  Users,
  FileText,
  Receipt,
  MessageSquare,
  FileDown,
  Newspaper,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Fahrzeuge", href: "/admin/fahrzeuge", icon: Car },
  { name: "Kunden", href: "/admin/kunden", icon: Users },
  { name: "Verträge", href: "/admin/vertraege", icon: FileText },
  { name: "Rechnungen", href: "/admin/rechnungen", icon: Receipt },
  { name: "Anfragen", href: "/admin/anfragen", icon: MessageSquare },
  { name: "Export", href: "/admin/export", icon: FileDown },
  { name: "Blog", href: "/admin/blog", icon: Newspaper },
  { name: "Einstellungen", href: "/admin/einstellungen", icon: Settings },
]

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-zinc-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
          <span className="text-lg font-bold text-zinc-900">ST</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">ST Motors</span>
          <span className="text-xs text-zinc-400">Admin Panel</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-zinc-400 hover:text-white lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-zinc-800 p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Abmelden
        </button>
      </div>
    </div>
  )
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Hamburger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 lg:block">
        <div className="fixed inset-y-0 left-0 w-64">
          <SidebarContent />
        </div>
      </aside>
    </>
  )
}

