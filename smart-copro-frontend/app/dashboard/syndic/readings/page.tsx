"use client"

import { useState, useEffect, useCallback } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  Loader2, Trash2, Edit2, Search, Gauge, 
  Save, Calendar, Clock, MessageSquare 
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function ReadingsLog() {
  const [readings, setReadings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingReading, setEditingReading] = useState<any>(null)

  const fetchReadings = useCallback(async () => {
    try {
      setLoading(true)
      const res = await axiosInstance.get(`/api/consumption/releves/?_t=${Date.now()}`)
      const data = Array.isArray(res.data) ? res.data : res.data.results || []
      setReadings(data)
    } catch (err) { 
      toast.error("Échec de synchronisation") 
    } finally { 
      setLoading(false) 
    }
  }, [])

  useEffect(() => { fetchReadings() }, [fetchReadings])

  const handleDelete = async (id: number) => {
    if (!window.confirm("Action irréversible : Supprimer ce relevé ? (Note: Cela ne supprimera pas l'alerte historique automatiquement)")) return

    try {
      await axiosInstance.delete(`/api/consumption/releves/${id}/`)
      setReadings(prev => prev.filter(r => r.id !== id))
      toast.success("Relevé effacé")
    } catch (err) {
      toast.error("Erreur de suppression")
      fetchReadings()
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReading) return

    try {
      const payload = {
        valeur: editingReading.valeur,
        commentaire: editingReading.commentaire
      }
      const res = await axiosInstance.patch(`/api/consumption/releves/${editingReading.id}/`, payload)
      setReadings(prev => prev.map(r => r.id === editingReading.id ? res.data : r))
      toast.success("Mise à jour réussie")
      setEditingReading(null)
    } catch (err) { 
      toast.error("Erreur d'écriture") 
    }
  }

  const filtered = readings.filter(r => 
    (r.compteur_reference || "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-[#F8FAFC]">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 overflow-auto text-gray-900">
          
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black tracking-tighter italic uppercase text-slate-900">Journal de Consommation</h1>
              <p className="text-slate-500 font-medium">Consultez et rectifiez les mesures historiques.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Filtrer par référence..." 
                  className="pl-10 w-64 rounded-xl bg-white border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={fetchReadings} variant="outline" className="rounded-xl border-slate-200 bg-white">
                 Actualiser
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-blue-600" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed text-slate-400 font-bold uppercase">
                Aucun relevé en base
              </div>
            ) : (
              filtered.map((r) => (
                <Card key={r.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white group">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-10">
                      {/* Section Compteur */}
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <Gauge className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Source</p>
                           <p className="font-black text-xl">{r.compteur_reference}</p>
                        </div>
                      </div>

                      {/* Section Valeur */}
                      <div className="min-w-[100px]">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mesure</p>
                         <p className="text-2xl font-black text-blue-600">{r.valeur} <small className="text-xs">U</small></p>
                      </div>

                      {/* Section Date (Celle que tu voulais !) */}
                      <div className="hidden lg:block border-l pl-10 border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-center lg:text-left">Date & Heure</p>
                         <div className="flex items-center gap-2 text-slate-600 font-bold">
                            <Calendar className="w-3 h-3 text-slate-300" />
                            <span>{new Date(r.date_releve).toLocaleDateString()}</span>
                            <Clock className="w-3 h-3 text-slate-300 ml-1" />
                            <span>{new Date(r.date_releve).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={() => setEditingReading({...r})} className="h-11 w-11 rounded-xl text-blue-600 hover:bg-blue-50">
                        <Edit2 className="w-5 h-5"/>
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(r.id)} className="h-11 w-11 rounded-xl text-red-600 hover:bg-red-50">
                        <Trash2 className="w-5 h-5"/>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Dialog open={!!editingReading} onOpenChange={() => setEditingReading(null)}>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black italic flex items-center gap-2 text-blue-600">
                  <Edit2 className="w-6 h-6" /> Rectifier Mesure
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdate} className="space-y-6 pt-4 font-bold">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Valeur Numérique</label>
                  <Input 
                    type="number" step="0.01" 
                    value={editingReading?.valeur ?? ""} 
                    onChange={e => setEditingReading({...editingReading, valeur: e.target.value})}
                    className="h-16 text-3xl font-black rounded-2xl border-2 text-center focus:border-blue-600"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Commentaire / Justification</label>
                  <Input 
                    placeholder="Pourquoi cette modification ?"
                    value={editingReading?.commentaire ?? ""} 
                    onChange={e => setEditingReading({...editingReading, commentaire: e.target.value})}
                    className="h-12 rounded-xl border-2 italic"
                  />
                </div>
                <Button type="submit" className="w-full h-16 bg-blue-600 text-white font-black text-xl rounded-2xl shadow-xl uppercase tracking-tighter">
                  <Save className="mr-2 h-6 w-6"/> Enregistrer en base
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}