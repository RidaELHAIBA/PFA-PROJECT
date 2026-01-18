"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authService } from "@/lib/auth"
import { BarChart3, Users, Wrench, FileText, LogOut, Menu, X, Home, User } from "lucide-react"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  {
    label: "Vue d'ensemble",
    href: "/dashboard/syndic",
    icon: <Home className="w-5 h-5" />,
    roles: ["SYNDIC"],
  },
  {
    label: "Gestion Résidents",
    href: "/dashboard/syndic/residents",
    icon: <Users className="w-5 h-5" />,
    roles: ["SYNDIC"],
  },
  {
    label: "Gestion Techniciens",
    href: "/dashboard/syndic/technicians",
    icon: <Wrench className="w-5 h-5" />,
    roles: ["SYNDIC"],
  },
  {
    label: "Réclamations & Alertes",
    href: "/dashboard/syndic/claims",
    icon: <FileText className="w-5 h-5" />,
    roles: ["SYNDIC"],
  },
  {
    label: "Interventions",
    href: "/dashboard/syndic/interventions",
    icon: <Wrench className="w-5 h-5" />,
    roles: ["SYNDIC"],
  },
  {
    label: "Compteurs & Parties Communes",
    href: "/dashboard/syndic/infrastructure",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["SYNDIC"],
  },
  {
    label: "Journal des Relevés",
    href: "/dashboard/syndic/readings",
    icon: <FileText className="w-5 h-5" />,
    roles: ["SYNDIC"],
  },
  {
    label: "Configuration des seuils",
    href: "/dashboard/syndic/thresholds",
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ["SYNDIC"],
  },
  {
  label: "Rapports PDF",
  href: "/dashboard/syndic/reports",
  icon: <FileText className="w-5 h-5" />,
  roles: ["SYNDIC"],
  },
  {
  label: "Profile",
  href: "/dashboard/syndic/profil",
  icon: <User className="w-5 h-5" />,
  roles: ["SYNDIC"],
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const userRole = authService.getUserRole()
  const userData = authService.getUserData()

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole || ""))

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 z-30 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-2xl font-bold text-sidebar-primary">Smart Copro</h1>
            <p className="text-sm text-sidebar-foreground/60 mt-1">{userRole}</p>
          </div>

          {/* User Info */}
          {userData && (
            <div className="p-4 border-b border-sidebar-border">
              
              <p className="text-sm text-sidebar-foreground/60">{userData.email}</p>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname === item.href ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-sidebar-border">
            <Button variant="destructive" className="w-full justify-start gap-3" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
