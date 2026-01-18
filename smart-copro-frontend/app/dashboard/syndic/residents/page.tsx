"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, UserPlus, Mail, Trash2, Edit2, X, User, Lock, Phone, Search } from "lucide-react"
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

export default function ResidentsManagement() {
  const [residents, setResidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  // ÉTATS POUR LE FILTRAGE
  const [searchTerm, setSearchTerm] = useState("")
  
  const [editingResident, setEditingResident] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    nom: "", 
    prenom: "", 
    telephone: "",
    role: "RESIDENT" 
  })

  const fetchResidents = async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get("/api/users/gestion-residents/")
      setResidents(res.data)
    } catch (err) { 
      toast.error("Erreur de chargement des données") 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchResidents() }, [])

  // LOGIQUE DE FILTRAGE PAR NOM
  const filteredResidents = residents.filter((res: any) => {
    const fullSearch = (res.nom + " " + res.prenom).toLowerCase();
    return fullSearch.includes(searchTerm.toLowerCase());
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axiosInstance.post("/api/users/gestion-residents/", formData)
      toast.success("Résident ajouté avec succès")
      setIsAdding(false)
      setFormData({ username: "", email: "", password: "", nom: "", prenom: "", telephone: "", role: "RESIDENT" })
      fetchResidents()
    } catch (err) { toast.error("Erreur lors de l'ajout") }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axiosInstance.put(`/api/users/gestion-residents/${editingResident.id}/`, editingResident)
      toast.success("Compte mis à jour avec succès")
      setEditingResident(null)
      fetchResidents()
    } catch (err) { toast.error("Erreur de mise à jour") }
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    try {
      await axiosInstance.delete(`/api/users/gestion-residents/${deletingId}/`)
      toast.success("Résident supprimé définitivement")
      setDeletingId(null)
      fetchResidents()
    } catch (err) { toast.error("Erreur de suppression") }
  }

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-background text-gray-900">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 overflow-auto">
          
          {/* Header Stylé */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Gestion des Résidents</h1>
              <p className="text-muted-foreground mt-2 text-lg italic">Administrez les comptes et accès des habitants.</p>
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

              <Button onClick={() => setIsAdding(!isAdding)} className="bg-black text-white hover:bg-zinc-800 px-6 py-6 rounded-xl shadow-lg transition-all">
                {isAdding ? <X className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />}
                {isAdding ? "Annuler" : "Nouveau Résident"}
              </Button>
            </div>
          </div>

          {/* Formulaire d'Ajout */}
          {isAdding && (
            <Card className="mb-10 border-2 border-zinc-100 shadow-xl rounded-2xl animate-in fade-in slide-in-from-top-5">
              <CardContent className="pt-8">
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input placeholder="Nom" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required className="rounded-xl h-12" />
                  <Input placeholder="Prénom" value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} required className="rounded-xl h-12" />
                  <Input placeholder="Identifiant (Username)" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required className="rounded-xl h-12" />
                  <Input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="rounded-xl h-12" />
                  <Input placeholder="Téléphone" value={formData.telephone} onChange={e => setFormData({...formData, telephone: e.target.value})} className="rounded-xl h-12" />
                  <Input placeholder="Mot de passe" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="rounded-xl h-12" />
                  <Button type="submit" className="md:col-span-3 h-12 text-lg font-bold bg-zinc-900 rounded-xl">Créer le compte résident</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Liste des Résidents Filtrée */}
          <div className="grid gap-5">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-zinc-400" /></div>
            ) : filteredResidents.length === 0 ? (
              <div className="py-20 text-center text-slate-400 italic">Aucun résident ne correspond à votre recherche.</div>
            ) : filteredResidents.map((res: any) => (
              <Card key={res.id} className="group border-zinc-200 hover:border-black transition-all shadow-sm rounded-2xl bg-white">
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-2xl border border-zinc-200 group-hover:bg-black group-hover:text-white transition-colors">
                      {res.nom ? res.nom[0].toUpperCase() : <User />}
                    </div>
                    <div>
                      <p className="font-extrabold text-2xl tracking-tight uppercase text-slate-900">
                        {res.prenom || res.nom ? `${res.prenom || ""} ${res.nom || ""}` : res.username}
                      </p>
                      <div className="flex flex-wrap items-center gap-6 mt-2 text-zinc-500">
                        <span className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> {res.email}</span>
                        {res.telephone && <span className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {res.telephone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setEditingResident(res)} className="rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50">
                      <Edit2 className="h-4 w-4 mr-2" /> Modifier
                    </Button>
                    <Button variant="outline" onClick={() => setDeletingId(res.id)} className="rounded-xl border-red-100 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dialogs de Modif et Suppression restent identiques au code source initial */}
          <Dialog open={!!editingResident} onOpenChange={() => setEditingResident(null)}>
             {/* ... contenu identique ... */}
             <DialogContent className="sm:max-w-[600px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">Modifier Profil</DialogTitle>
                <DialogDescription className="text-lg italic">Mise à jour des informations de l'habitant.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><label className="text-sm font-bold ml-1">Nom</label><Input value={editingResident?.nom || ""} onChange={e => setEditingResident({...editingResident, nom: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-sm font-bold ml-1">Prénom</label><Input value={editingResident?.prenom || ""} onChange={e => setEditingResident({...editingResident, prenom: e.target.value})} /></div>
                </div>
                <div className="space-y-2"><label className="text-sm font-bold ml-1">Email de contact</label><Input type="email" value={editingResident?.email || ""} onChange={e => setEditingResident({...editingResident, email: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-bold ml-1">Téléphone</label><Input value={editingResident?.telephone || ""} onChange={e => setEditingResident({...editingResident, telephone: e.target.value})} /></div>
                <div className="space-y-2"><label className="text-sm font-bold ml-1 flex gap-2 items-center"><Lock className="h-4 w-4"/> Nouveau mot de passe</label><Input type="password" placeholder="Laisser vide" onChange={e => setEditingResident({...editingResident, password: e.target.value})} /></div>
                <DialogFooter className="pt-6"><Button type="button" variant="ghost" onClick={() => setEditingResident(null)}>Annuler</Button><Button type="submit" className="bg-black text-white px-8">Sauvegarder</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
            <AlertDialogContent className="border-t-8 border-t-red-600 rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-3xl font-black text-zinc-900">Confirmation de suppression</AlertDialogTitle>
                <AlertDialogDescription className="text-lg text-zinc-600">Cette action est irrévocable.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-8">
                <AlertDialogCancel className="rounded-xl border-zinc-200">Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white rounded-xl hover:bg-red-700 px-8">Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}