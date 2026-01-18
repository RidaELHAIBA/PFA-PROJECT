"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, UserPlus, Mail, Trash2, Edit2, X, Wrench, Lock, Phone, Search } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function TechniciansManagement() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  // ÉTATS POUR LE FILTRAGE
  const [searchTerm, setSearchTerm] = useState("")

  const [editingTech, setEditingTech] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({ 
    username: "", email: "", password: "", nom: "", prenom: "", telephone: "", role: "TECHNICIEN" 
  })

  const TECH_ENDPOINT = "/api/users/gestion-techniciens/"

  const fetchTechnicians = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get(TECH_ENDPOINT) 
      setTechnicians(Array.isArray(res.data) ? res.data : [])
    } catch (err) { 
      toast.error("Erreur lors du chargement des techniciens") 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchTechnicians() }, [])

  // LOGIQUE DE FILTRAGE PAR NOM
  const filteredTechnicians = technicians.filter((tech: any) => {
    const fullSearch = (tech.nom + " " + tech.prenom).toLowerCase();
    return fullSearch.includes(searchTerm.toLowerCase());
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axiosInstance.post(TECH_ENDPOINT, formData)
      toast.success("Technicien ajouté au staff")
      setIsAdding(false)
      setFormData({ username: "", email: "", password: "", nom: "", prenom: "", telephone: "", role: "TECHNICIEN" })
      fetchTechnicians()
    } catch (err: any) { 
      toast.error("Erreur lors de l'ajout") 
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const updateData = { ...editingTech }
    if (!updateData.password) delete updateData.password

    try {
      await axiosInstance.patch(`${TECH_ENDPOINT}${editingTech.id}/`, updateData)
      toast.success("Profil technicien mis à jour")
      setEditingTech(null)
      fetchTechnicians()
    } catch (err) { 
      toast.error("Erreur lors de la mise à jour") 
    }
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    try {
      await axiosInstance.delete(`${TECH_ENDPOINT}${deletingId}/`)
      toast.success("Technicien retiré du staff")
      setDeletingId(null)
      fetchTechnicians()
    } catch (err) { 
      toast.error("Erreur lors de la suppression") 
    }
  }

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-background text-gray-900">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 overflow-auto">
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Gestion du Staff Technique</h1>
              <p className="text-muted-foreground mt-2 text-lg">Administrez vos intervenants et techniciens de maintenance.</p>
            </div>

            {/* BARRE DE FILTRAGE - CODE EXACT DEMANDÉ */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Filtrer par nom..." 
                  className="pl-10 w-64 rounded-xl bg-white border-slate-200 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button onClick={() => setIsAdding(!isAdding)} className="bg-blue-700 text-white hover:bg-blue-800 px-6 py-6 rounded-xl shadow-lg transition-all">
                {isAdding ? <X className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />}
                {isAdding ? "Annuler" : "Nouveau Technicien"}
              </Button>
            </div>
          </div>

          {/* Formulaire d'Ajout */}
          {isAdding && (
            <Card className="mb-10 border-2 border-blue-100 shadow-xl rounded-2xl animate-in fade-in slide-in-from-top-5">
              <CardContent className="pt-8">
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required className="h-12 rounded-xl" />
                  <Input placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required className="h-12 rounded-xl" />
                  <Input placeholder="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required className="h-12 rounded-xl" />
                  <Input placeholder="Email professionnel" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="h-12 rounded-xl" />
                  <Input placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="h-12 rounded-xl" />
                  <Input placeholder="Mot de passe" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="h-12 rounded-xl" />
                  <Button type="submit" className="md:col-span-3 h-12 text-lg font-bold bg-blue-700 hover:bg-blue-800 rounded-xl">Inscrire le technicien</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Liste Filtrée */}
          <div className="grid gap-5">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
            ) : filteredTechnicians.length === 0 ? (
              <div className="py-20 text-center text-slate-400 italic">Aucun technicien trouvé.</div>
            ) : filteredTechnicians.map((tech: any) => (
              <Card key={tech.id} className="group border-zinc-200 hover:border-blue-600 transition-all shadow-sm rounded-2xl bg-white">
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-2xl border border-blue-100 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      <Wrench className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-extrabold text-2xl tracking-tight uppercase">
                        {tech.prenom || tech.nom ? `${tech.prenom || ""} ${tech.nom || ""}` : tech.username}
                      </p>
                      <div className="flex flex-wrap items-center gap-6 mt-2 text-zinc-500">
                        <span className="flex items-center gap-2 text-sm font-medium"><Mail className="h-4 w-4" /> {tech.email}</span>
                        {tech.telephone && <span className="flex items-center gap-2 text-sm font-medium"><Phone className="h-4 w-4" /> {tech.telephone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setEditingTech(tech)} className="rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50">
                      <Edit2 className="h-4 w-4 mr-2" /> Modifier
                    </Button>
                    <Button variant="outline" onClick={() => setDeletingId(tech.id)} className="rounded-xl border-red-100 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dialog Modification */}
          <Dialog open={!!editingTech} onOpenChange={() => setEditingTech(null)}>
            <DialogContent className="sm:max-w-[600px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">Profil Technicien</DialogTitle>
                <DialogDescription className="text-lg italic">Mise à jour des accès et informations de contact.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-bold">Nom</label><Input value={editingTech?.nom || ""} onChange={e => setEditingTech({...editingTech, nom: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-bold">Prénom</label><Input value={editingTech?.prenom || ""} onChange={e => setEditingTech({...editingTech, prenom: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-bold">Email pro</label><Input type="email" value={editingTech?.email || ""} onChange={e => setEditingTech({...editingTech, email: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-bold">Téléphone</label><Input value={editingTech?.telephone || ""} onChange={e => setEditingTech({...editingTech, telephone: e.target.value})} /></div>
                <div className="space-y-2">
                  <label className="text-sm font-bold flex gap-2 items-center"><Lock className="h-4 w-4"/> Nouveau mot de passe</label>
                  <Input type="password" placeholder="Laisser vide" onChange={e => setEditingTech({...editingTech, password: e.target.value})} />
                </div>
                <DialogFooter className="pt-6">
                  <Button type="submit" className="bg-blue-700 text-white px-8 rounded-xl h-12">Sauvegarder</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* AlertDialog Suppression */}
          <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
            <AlertDialogContent className="border-t-8 border-t-red-600 rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-3xl font-black text-zinc-900">Supprimer du staff ?</AlertDialogTitle>
                <AlertDialogDescription className="text-lg">Cette action retirera le technicien du système.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8">
                <AlertDialogCancel className="rounded-xl font-bold">Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white rounded-xl hover:bg-red-700 px-8">Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}