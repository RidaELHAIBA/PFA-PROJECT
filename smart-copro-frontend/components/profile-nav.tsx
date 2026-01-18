"use client"

import { LogOut, Settings } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu" // Vérifie que ce fichier existe après l'install
import { Avatar, AvatarFallback } from "@/components/ui/avatar" // Vérifie que ce fichier existe après l'install
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"

export function ProfileNav({ userEmail }: { userEmail: string }) {
  const router = useRouter()

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  return (
    <div className="flex items-center gap-4 px-8 py-4 bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          <div className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-2xl transition-all border border-transparent hover:border-slate-100 cursor-pointer">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session active</p>
              <p className="text-sm font-bold text-slate-900">{userEmail}</p>
            </div>
            <Avatar className="h-10 w-10 border-2 border-slate-900 shadow-sm">
              <AvatarFallback className="bg-slate-900 text-white font-black italic">
                {userEmail ? userEmail[0].toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 mt-2 rounded-[2rem] shadow-2xl border-none p-2" align="end">
          <DropdownMenuLabel className="font-black uppercase text-[10px] text-slate-400 px-4 py-3 tracking-widest">Options Profil</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-50" />
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')} className="cursor-pointer gap-3 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" /> Paramètres
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-50" />
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-3 py-4 rounded-2xl font-bold text-red-600 focus:bg-red-50 focus:text-red-600 transition-colors">
            <LogOut className="w-5 h-5" /> Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}