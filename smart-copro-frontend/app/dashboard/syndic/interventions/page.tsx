"use client"

import { useState, useEffect, useMemo } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Wrench, Calendar, User, FileText, Plus, Trash2, CheckCircle2, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function InterventionsManagement() {
  const [interventions, setInterventions] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  
  // ÉTAT POUR LE FILTRAGE
  const [searchTerm, setSearchTerm] = useState("")

  const [formData, setFormData] = useState({
    reclamation: "",
    technicien: "",
    date_intervention: "",
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [intRes, techRes, claimRes] = await Promise.all([
        axiosInstance.get("/api/claims/interventions/"),
        axiosInstance.get("/api/users/gestion-techniciens/"),
        axiosInstance.get("/api/claims/traitement/reclamations/")
      ])
      setInterventions(intRes.data)
      setTechnicians(techRes.data)
      setClaims(claimRes.data.filter((c: any) => c.statut !== "RESOLUE"))
    } catch (err) {
      toast.error("Erreur de chargement des données")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // LOGIQUE DE FILTRAGE DYNAMIQUE
  const filteredInterventions = useMemo(() => {
    return interventions.filter((int: any) => {
      const searchStr = searchTerm.toLowerCase();
      const techFullName = `${int.technicien_nom} ${int.technicien_prenom}`.toLowerCase();
      const missionRef = `#INT-${int.id}`.toLowerCase();
      return techFullName.includes(searchStr) || missionRef.includes(searchStr);
    });
  }, [interventions, searchTerm]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.reclamation || !formData.technicien) {
        return toast.error("Veuillez remplir tous les champs")
    }
    try {
      await axiosInstance.post("/api/claims/interventions/", formData)
      toast.success("Intervention créée et technicien assigné !")
      setIsAdding(false)
      setFormData({ reclamation: "", technicien: "", date_intervention: "" })
      fetchData()
    } catch (err) {
      toast.error("Erreur lors de la création de l'intervention")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axiosInstance.delete(`/api/claims/interventions/${id}/`)
      toast.success("Intervention annulée")
      fetchData()
    } catch (err) {
      toast.error("Erreur lors de la suppression")
    }
  }

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-[#F8FAFC]">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 overflow-auto">
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ordres d'Intervention</h1>
              <p className="text-slate-500 mt-2 text-lg italic">Planifiez et assignez les travaux de maintenance.</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* BARRE DE FILTRAGE À DROITE */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  placeholder="Filtrer par technicien..." 
                  className="pl-10 w-64 h-10 rounded-xl bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 hover:bg-blue-700 h-12 rounded-xl px-6 font-bold shadow-lg shadow-blue-100">
                {isAdding ? "Annuler" : <><Plus className="mr-2 h-5 w-5"/> Nouvelle Mission</>}
              </Button>
            </div>
          </div>

          {isAdding && (
            <Card className="mb-10 border-2 border-blue-100 shadow-xl rounded-2xl animate-in fade-in slide-in-from-top-4">
              <CardHeader><CardTitle className="text-blue-700">Assigner un Technicien</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCreateIntervention} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Réclamation concernée</label>
                    <Select onValueChange={(val) => setFormData({...formData, reclamation: val})}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Choisir un problème" /></SelectTrigger>
                      <SelectContent>
                        {claims.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>#REC-{c.id} : {c.type_reclamation}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Technicien</label>
                    <Select onValueChange={(val) => setFormData({...formData, technicien: val})}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Choisir un expert" /></SelectTrigger>
                      <SelectContent>
                        {technicians.map((t) => (
                          <SelectItem key={t.id} value={t.id.toString()}>{t.prenom} {t.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Date prévue</label>
                    <Input type="datetime-local" className="h-12 rounded-xl" onChange={(e) => setFormData({...formData, date_intervention: e.target.value})} required />
                  </div>

                  <Button type="submit" className="md:col-span-3 bg-blue-700 h-12 text-white text-lg font-black uppercase tracking-widest rounded-xl">Lancer l'intervention</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6">
            {loading ? <Loader2 className="animate-spin mx-auto text-blue-500 h-10 w-10 mt-20" /> : 
             filteredInterventions.length === 0 ? <p className="text-center py-20 text-slate-400 italic">Aucune mission trouvée pour cette recherche.</p> :
             filteredInterventions.map((int) => (
              <Card key={int.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden group bg-white">
                <div className="flex">
                  <div className="w-2 bg-blue-600" />
                  <CardContent className="p-6 flex-1 flex justify-between items-center">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-100 text-blue-700 font-mono">MISSION #INT-{int.id}</Badge>
                        <span className="flex items-center gap-1 text-slate-400 text-sm font-bold"><Calendar className="h-4 w-4"/> {new Date(int.date_intervention).toLocaleString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8">
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technicien assigné</label>
                            {/* AFFICHAGE DU NOM COMPLET ICI */}
                            <p className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                              <User className="h-5 w-5 text-blue-500"/> 
                              {int.technicien_nom ? `${int.technicien_nom} ${int.technicien_prenom}` : "Technicien inconnu"}
                            </p>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Réclamation liée</label>
                            <p className="font-bold text-slate-800 flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-orange-500"/> #REC-{int.reclamation}</p>
                         </div>
                      </div>

                      {int.rapport && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 mt-2">
                            <label className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Rapport Final</label>
                            <p className="text-green-800 italic mt-1">{int.rapport}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(int.id)} className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full h-12 w-12"><Trash2 className="h-6 w-6"/></Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}