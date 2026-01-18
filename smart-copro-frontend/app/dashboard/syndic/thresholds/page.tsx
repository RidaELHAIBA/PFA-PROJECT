"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  Loader2, ShieldAlert, Plus, Trash2, Edit2, 
  BellRing, Gauge, MapPin, AlertTriangle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ThresholdsManagement() {
  const [thresholds, setThresholds] = useState<any[]>([])
  const [compteurs, setCompteurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // États pour les modales
  const [isAdding, setIsAdding] = useState(false)
  const [editingThreshold, setEditingThreshold] = useState<any>(null)

  const [formData, setFormData] = useState({
    type_alerte: "SURCONS",
    valeur_seuil: "",
    compteur_reference: ""
  })

  const [suggestedValue, setSuggestedValue] = useState<number | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [seuilsRes, compRes] = await Promise.all([
        axiosInstance.get("/api/alerts/seuils/"),
        axiosInstance.get("/api/consumption/compteurs/")
      ])
      setThresholds(seuilsRes.data)
      setCompteurs(compRes.data)
    } catch (err) { 
      toast.error("Erreur de chargement des données") 
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { fetchData() }, [])

  // Intelligence : Suggérer la valeur par défaut du compteur lors du choix
  const handleCompteurChange = (ref: string) => {
    const selectedCompteur = compteurs.find(c => c.reference === ref)
    if (selectedCompteur) {
      setSuggestedValue(selectedCompteur.seuil_alerte)
      setFormData({ 
        ...formData, 
        compteur_reference: ref, 
        valeur_seuil: selectedCompteur.seuil_alerte.toString() 
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingThreshold) {
        await axiosInstance.put(`/api/alerts/seuils/${editingThreshold.id}/`, formData)
        toast.success("Seuil mis à jour avec succès")
      } else {
        await axiosInstance.post("/api/alerts/seuils/", formData)
        toast.success("Surveillance activée pour ce compteur")
      }
      setIsAdding(false)
      setEditingThreshold(null)
      fetchData()
    } catch (err) { 
      toast.error("Erreur : Ce compteur possède déjà une règle de ce type") 
    }
  }

  const handleDelete = async (id: number) => {
    if(!confirm("Désactiver définitivement cette surveillance ?")) return
    try {
      await axiosInstance.delete(`/api/alerts/seuils/${id}/`)
      toast.success("Règle de surveillance supprimée")
      fetchData()
    } catch (err) { 
      toast.error("Erreur lors de la suppression") 
    }
  }

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-[#F8FAFC]">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 overflow-auto text-gray-900">
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Gestion des Seuils</h1>
              <p className="text-slate-500 mt-2 text-lg italic font-medium">Contrôlez les limites de consommation et les alertes IoT.</p>
            </div>
            <Button 
              onClick={() => { 
                setEditingThreshold(null); 
                setFormData({type_alerte: "SURCONS", valeur_seuil: "", compteur_reference: ""}); 
                setSuggestedValue(null);
                setIsAdding(true) 
              }} 
              className="bg-red-600 hover:bg-red-700 h-12 rounded-xl px-6 font-bold shadow-lg shadow-red-100"
            >
              <Plus className="mr-2 h-5 w-5"/> Nouveau Seuil
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <Loader2 className="animate-spin col-span-3 mx-auto h-10 w-10 text-red-500 mt-20" />
            ) : thresholds.length === 0 ? (
              <Card className="col-span-3 p-20 text-center border-2 border-dashed bg-white rounded-[2rem]">
                 <ShieldAlert className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 font-bold uppercase tracking-widest">Aucune surveillance active</p>
              </Card>
            ) : (
              thresholds.map((s) => {
                const meter = compteurs.find(c => c.reference === s.compteur_reference);
                return (
                  <Card key={s.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] bg-white group overflow-hidden">
                    <div className={`h-2 w-full ${s.type_alerte === 'SURCONS' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-red-50 transition-colors">
                            <Gauge className="w-6 h-6 text-red-600"/>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Compteur</p>
                            <h3 className="text-xl font-black text-slate-900">{s.compteur_reference}</h3>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingThreshold(s);
                            setFormData({
                              type_alerte: s.type_alerte, 
                              valeur_seuil: s.valeur_seuil.toString(), 
                              compteur_reference: s.compteur_reference
                            });
                            setIsAdding(true);
                          }} className="rounded-full hover:bg-blue-50">
                            <Edit2 className="w-4 h-4 text-blue-600"/>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)} className="rounded-full hover:bg-red-50">
                            <Trash2 className="w-4 h-4 text-red-600"/>
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {s.type_alerte === 'SURCONS' ? 'Limite Max' : 'Seuil Anomalie'}
                            </span>
                            <span className="text-3xl font-black text-slate-900">{s.valeur_seuil} <small className="text-xs uppercase font-bold text-slate-400">U</small></span>
                          </div>
                          <Badge className={`${s.type_alerte === 'SURCONS' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} border-none font-bold uppercase text-[9px]`}>
                            {s.type_alerte}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium italic">
                          <MapPin className="w-4 h-4" /> {meter?.localisation || "Zone non définie"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* MODALE D'AJOUT ET MODIFICATION */}
          <Dialog open={isAdding} onOpenChange={(open) => { if(!open) setIsAdding(false); }}>
            <DialogContent className="rounded-[2.5rem] p-8 max-w-lg border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <BellRing className="text-red-600 w-8 h-8 animate-pulse" />
                  {editingThreshold ? "Ajuster la Limite" : "Nouvelle Surveillance"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Choisir le Compteur</label>
                  <Select 
                    onValueChange={handleCompteurChange} 
                    defaultValue={editingThreshold?.compteur_reference}
                    disabled={!!editingThreshold}
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 font-bold focus:ring-red-500">
                      <SelectValue placeholder="Référence du matériel" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {compteurs.map(c => (
                        <SelectItem key={c.id} value={c.reference} className="font-bold">
                          {c.reference} — <span className="text-slate-400 font-medium italic">{c.localisation}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Type de Risque</label>
                  <Select onValueChange={(val) => setFormData({...formData, type_alerte: val})} defaultValue={formData.type_alerte}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 font-bold focus:ring-red-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="SURCONS" className="font-bold">📈 Surconsommation</SelectItem>
                      <SelectItem value="ANOMALIE_RELEVE" className="font-bold">⚠️ Incohérence de données</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Seuil de Déclenchement</label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={formData.valeur_seuil}
                      onChange={(e) => setFormData({...formData, valeur_seuil: e.target.value})}
                      className="h-20 rounded-2xl border-2 border-slate-100 text-4xl font-black text-red-600 focus:border-red-600 transition-all text-center" 
                      required 
                    />
                    {suggestedValue && !editingThreshold && (
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-6">
                        <Badge variant="outline" className="bg-white border-red-100 text-red-400 text-[9px] font-black uppercase flex gap-1">
                          <AlertTriangle className="w-3 h-3" /> Valeur recommandée: {suggestedValue}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full h-16 bg-red-600 hover:bg-red-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-red-100 uppercase tracking-widest mt-4">
                   {editingThreshold ? "Appliquer les corrections" : "Lancer la surveillance"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

        </main>
      </div>
    </ProtectedRoute>
  )
}