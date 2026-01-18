"use client"

import React, { useState, useEffect, useCallback } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  Loader2, Wrench, Calendar, 
  Send, Clock, ChevronRight,
  Search, User, Phone, AlertTriangle, TrendingUp, CheckCircle2 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProfileNav } from "@/components/profile-nav"

export default function TechnicianDashboard() {
  const [interventions, setInterventions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null)
  const [report, setReport] = useState("")
  const [userData, setUserData] = useState<any>({ email: "" })

  const fetchInterventions = useCallback(async () => {
    try {
      setLoading(true)
      const storedData = localStorage.getItem("userData")
      if (storedData) setUserData(JSON.parse(storedData))

      const res = await axiosInstance.get(`/api/claims/mon-planning/?_t=${Date.now()}`)
      setInterventions(res.data)
    } catch (err) { 
      toast.error("Erreur de synchronisation") 
    } finally { 
      setLoading(false) 
    }
  }, [])

  useEffect(() => { fetchInterventions() }, [fetchInterventions])

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (report.length < 10) return toast.error("Rapport trop court.")
    try {
      await axiosInstance.patch(`/api/claims/mon-planning/${selectedIntervention.id}/`, {
        rapport: report
      })
      toast.success("Félicitations ! Mission accomplie.")
      setSelectedIntervention(null)
      setReport("")
      fetchInterventions() // On recharge pour voir le changement de couleur
    } catch (err) { toast.error("Erreur de validation") }
  }

  const filtered = interventions.filter(task => 
    task.probleme_description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalMissions = interventions.length
  const urgentCount = interventions.filter(t => (t.priorite === 'URGENT' || t.priorite === 'HAUTE') && !t.rapport).length
  // Calcul réel de l'efficacité basé sur les rapports remplis
  const completedCount = interventions.filter(t => t.rapport && t.rapport.length > 0).length
  const efficiency = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0

  return (
    <ProtectedRoute requiredRole={["TECHNICIEN"]}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
        <ProfileNav userEmail={userData.email} />
        
        <main className="p-6 max-w-6xl mx-auto">
          {/* Header & Stats */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none text-slate-900">Mission Control</h1>
              <div className="relative w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Filtrer les missions..." 
                  className="pl-10 h-9 rounded-xl bg-white border-slate-100 shadow-sm text-sm focus:border-slate-900 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Card className="border-none shadow-sm bg-white p-4 rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><Clock className="w-5 h-5"/></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-2xl font-black">{totalMissions}</p>
                </div>
              </Card>
              <Card className="border-none shadow-sm bg-white p-4 rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 bg-red-600 rounded-xl flex items-center justify-center text-white"><AlertTriangle className="w-5 h-5"/></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Urgent</p>
                  <p className="text-2xl font-black text-red-600">{urgentCount}</p>
                </div>
              </Card>
              <Card className="border-none shadow-sm bg-white p-4 rounded-2xl flex items-center gap-3">
                <div className="h-10 w-10 bg-green-500 rounded-xl flex items-center justify-center text-white"><TrendingUp className="w-5 h-5"/></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Succès</p>
                  <p className="text-2xl font-black text-green-600">{efficiency}%</p>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" /> : 
              filtered.map((task) => {
                const isDone = task.rapport && task.rapport.length > 0; // Détection de l'état terminé
                
                return (
                  <Card key={task.id} className={`border-none shadow-sm rounded-3xl overflow-hidden transition-all duration-500 ${isDone ? 'bg-green-50/50 opacity-80' : 'bg-white'}`}>
                    <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex items-center gap-6 flex-1">
                        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isDone ? 'bg-green-500 text-white' : 'bg-slate-900 text-white'}`}>
                          {isDone ? <CheckCircle2 className="w-8 h-8" /> : <Wrench className="w-7 h-7" />}
                        </div>
                        <div>
                          <div className="flex gap-2 mb-2">
                             <Badge className={`${isDone ? 'bg-green-100 text-green-700' : (task.priorite === 'URGENT' || task.priorite === 'HAUTE') ? 'bg-red-600' : 'bg-slate-900'} text-white border-none font-black text-[9px] px-3`}>
                                {isDone ? 'TERMINÉ' : task.priorite}
                             </Badge>
                          </div>
                          <h3 className={`text-xl font-black tracking-tighter mb-1 leading-none transition-all ${isDone ? 'text-green-900 line-through' : 'text-slate-900'}`}>
                            {task.probleme_description}
                          </h3>
                          <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">
                            <Calendar className="inline w-3 h-3 mr-1"/> {new Date(task.date_intervention).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {isDone ? (
                        <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-green-200">
                          <CheckCircle2 className="w-4 h-4" /> Rapport Transmis
                        </div>
                      ) : (
                        <Button onClick={() => setSelectedIntervention(task)} className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all hover:scale-105 active:scale-95">
                          RAPPORT <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            }
          </div>

          <Dialog open={!!selectedIntervention} onOpenChange={() => setSelectedIntervention(null)}>
            <DialogContent className="rounded-[2.5rem] p-8 max-w-xl border-none shadow-2xl">
              <DialogHeader><DialogTitle className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-center">Finaliser l'intervention</DialogTitle></DialogHeader>
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-5">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-slate-900"><User className="w-5 h-5" /></div>
                  <div className="flex flex-col">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Déclarant</p>
                    <p className="font-black text-lg text-slate-900 leading-none capitalize">{selectedIntervention?.resident_nom} {selectedIntervention?.resident_prenom}</p>
                    <p className="mt-2 font-bold text-blue-600 text-sm flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {selectedIntervention?.resident_telephone}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-3 tracking-widest">Compte-rendu technique</label>
                  <Textarea 
                    placeholder="Qu'avez-vous fait ? (ex: Remplacement du fusible hall d'entrée...)"
                    className="min-h-[120px] rounded-2xl border-2 border-slate-100 p-4 text-sm"
                    value={report}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReport(e.target.value)}
                  />
                </div>

                <Button onClick={handleSubmitReport} className="w-full h-16 bg-slate-900 text-white font-black rounded-2xl text-lg uppercase tracking-widest shadow-xl">
                  <Send className="mr-3 h-5 w-5" /> Envoyer & Valider
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}