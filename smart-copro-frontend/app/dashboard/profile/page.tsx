"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { User, Lock, Save, ArrowLeft, Loader2, Phone } from "lucide-react"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({
    nom: "", prenom: "", telephone: "", email: "",
    old_password: "", new_password: ""
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/users/profile/me/") // Adapte l'URL selon ton router
        setProfile({ ...res.data, old_password: "", new_password: "" })
      } catch (err) { toast.error("Erreur de chargement") }
      finally { setLoading(false) }
    }
    fetchProfile()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axiosInstance.patch("/api/users/profile/me/", profile)
      toast.success("Profil mis à jour")
      setProfile({ ...profile, old_password: "", new_password: "" })
    } catch (err: any) {
      const errorData = err.response?.data
      if (errorData?.old_password) toast.error("Ancien mot de passe incorrect")
      else toast.error("Erreur de mise à jour")
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <main className="max-w-3xl mx-auto">
        

        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-10">Paramètres</h1>

        <form onSubmit={handleUpdate} className="space-y-6">
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-6">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-slate-900 text-white p-3 rounded-xl"><User /></div>
              <CardTitle className="text-xl font-black">Identité & Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Prénom" value={profile.prenom} onChange={e => setProfile({...profile, prenom: e.target.value})} className="h-12 rounded-xl" />
                <Input placeholder="Nom" value={profile.nom} onChange={e => setProfile({...profile, nom: e.target.value})} className="h-12 rounded-xl" />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <Input placeholder="Téléphone" className="pl-10 h-12 rounded-xl" value={profile.telephone} onChange={e => setProfile({...profile, telephone: e.target.value})} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-6">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-slate-900 text-white p-3 rounded-xl"><Lock /></div>
              <CardTitle className="text-xl font-black">Sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <Input type="password" placeholder="Ancien mot de passe" value={profile.old_password} onChange={e => setProfile({...profile, old_password: e.target.value})} className="h-12 rounded-xl" />
              <Input type="password" placeholder="Nouveau mot de passe" value={profile.new_password} onChange={e => setProfile({...profile, new_password: e.target.value})} className="h-12 rounded-xl" />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-16 bg-slate-900 text-white font-black rounded-[1.5rem] text-lg uppercase tracking-widest shadow-xl">
            <Save className="mr-2 h-5 w-5" /> Sauvegarder
          </Button>
        </form>
      </main>
    </div>
  )
}