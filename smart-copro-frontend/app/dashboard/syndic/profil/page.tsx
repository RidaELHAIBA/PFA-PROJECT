"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { User, Lock, Save, Loader2, Phone, Settings } from "lucide-react"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    nom: "", prenom: "", telephone: "", email: "",
    old_password: "", new_password: ""
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/users/profile/me/")
        setProfile({ ...res.data, old_password: "", new_password: "" })
      } catch (err) { 
        toast.error("Erreur de chargement") 
      } finally { 
        setLoading(false) 
      }
    }
    fetchProfile()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axiosInstance.patch("/api/users/profile/me/", profile)
      toast.success("Profil mis à jour !")
      setProfile({ ...profile, old_password: "", new_password: "" })
    } catch (err: any) {
      toast.error("Erreur de mise à jour")
    }
  }

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-[#F8FAFC]">
        {/* LA SIDEBAR NAVIGUABLE */}
        <SidebarNav />

        {/* CONTENU PRINCIPAL SANS BARRE SUPERIEURE */}
        <main className="flex-1 ml-64 p-8 overflow-auto">
          
          {/* TITRE ET DESCRIPTION PLACÉS DIRECTEMENT EN HAUT */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Settings className="h-10 w-10 text-slate-400" /> Paramètres du Compte
            </h1>
            <p className="text-slate-500 mt-2 text-lg italic">Gérez vos informations et votre sécurité sans distraction.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-8 max-w-5xl">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SECTION IDENTITÉ */}
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
                  <div className="h-2 bg-slate-900" />
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-slate-100 p-3 rounded-xl"><User className="text-slate-900" /></div>
                    <CardTitle className="text-xl font-black uppercase">Identité & Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Prénom</label>
                          <Input value={profile.prenom} onChange={e => setProfile({...profile, prenom: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nom</label>
                          <Input value={profile.nom} onChange={e => setProfile({...profile, nom: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none font-bold text-slate-900" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Mobile</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                          <Input className="pl-10 h-12 rounded-xl bg-slate-50 border-none font-black text-blue-600" value={profile.telephone} onChange={e => setProfile({...profile, telephone: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SECTION SÉCURITÉ */}
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden border border-slate-100">
                  <div className="h-2 bg-blue-600" />
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl"><Lock className="text-blue-600" /></div>
                    <CardTitle className="text-xl font-black uppercase">Sécurité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Ancien mot de passe</label>
                        <Input type="password" value={profile.old_password} onChange={e => setProfile({...profile, old_password: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" placeholder="••••••••" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nouveau mot de passe</label>
                        <Input type="password" value={profile.new_password} onChange={e => setProfile({...profile, new_password: e.target.value})} className="h-12 rounded-xl bg-slate-50 border-none" placeholder="••••••••" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* BOUTON SAUVEGARDE */}
              <Button type="submit" className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black rounded-2xl text-lg  shadow-xl transition-all active:scale-[0.98]">
                <Save className="mr-3 h-6 w-6" /> Enregistrer les changements
              </Button>

            </form>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}