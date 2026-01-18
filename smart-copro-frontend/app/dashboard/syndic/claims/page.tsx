"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { 
  Loader2, AlertTriangle, Clock, Wrench, 
  ArrowRight, ShieldAlert, MessageSquare, User, Eye, BarChart3
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ClaimsAndAlerts() {
  const router = useRouter()
  const [reclamations, setReclamations] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [recRes, alertRes] = await Promise.all([
        axiosInstance.get("/api/claims/traitement/reclamations/"),
        axiosInstance.get("/api/alerts/liste/")
      ])
      setReclamations(Array.isArray(recRes.data) ? recRes.data : [])
      setAlerts(Array.isArray(alertRes.data) ? alertRes.data : [])
    } catch (err) {
      toast.error("Erreur de synchronisation")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await axiosInstance.patch(`/api/claims/traitement/reclamations/${id}/`, { statut: newStatus })
      toast.success("Statut mis à jour")
      fetchData()
    } catch (err) {
      toast.error("Erreur de mise à jour")
    }
  }

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-[#F8FAFC]">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 overflow-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Centre de Maintenance</h1>
            <p className="text-slate-500 mt-2 text-lg italic">Suivi des requêtes résidents et alertes IoT.</p>
          </div>

          <Tabs defaultValue="reclamations" className="w-full">
            <TabsList className="bg-white border p-1 rounded-xl mb-8 shadow-sm">
              <TabsTrigger value="reclamations" className="rounded-lg px-8 py-3 data-[state=active]:bg-black data-[state=active]:text-white">
                <MessageSquare className="w-4 h-4 mr-2" /> Réclamations ({reclamations.length})
              </TabsTrigger>
              <TabsTrigger value="alerts" className="rounded-lg px-8 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                <ShieldAlert className="w-4 h-4 mr-2" /> Alertes IoT ({alerts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reclamations" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-slate-400 h-10 w-10" /></div>
              ) : (
                reclamations.map((rec) => (
                  <Card key={rec.id} className="border-none shadow-sm hover:shadow-md transition-all bg-white rounded-2xl overflow-hidden">
                    <div className="flex">
                      <div className={`w-2 ${rec.statut === 'RESOLUE' ? 'bg-green-500' : 'bg-orange-500'}`} />
                      <CardContent className="p-6 flex-1 flex justify-between items-center">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">#REC-{rec.id}</Badge>
                            <Badge className={rec.statut === 'RESOLUE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                              {rec.statut}
                            </Badge>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-800">{rec.type_reclamation}</h3>
                          <p className="text-slate-600 max-w-2xl">{rec.description}</p>
                          <div className="flex items-center gap-6 text-sm font-medium">
                             <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-slate-700">
                               <User className="w-4 h-4" /> Résident: {rec.resident_nom} {rec.resident_prenom}
                             </span>
                             <span className="text-slate-400 flex items-center gap-1"><Clock className="w-4 h-4"/> {new Date(rec.date_soumission).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3">
                          <Select onValueChange={(val: string) => handleUpdateStatus(rec.id, val)} defaultValue={rec.statut}>
                            <SelectTrigger className="w-[180px] rounded-xl"><SelectValue placeholder="Statut" /></SelectTrigger>
                            <SelectContent><SelectItem value="OUVERTE">Ouverte</SelectItem><SelectItem value="EN_COURS">En cours</SelectItem><SelectItem value="RESOLUE">Résolue</SelectItem></SelectContent>
                          </Select>
                          <Button onClick={() => router.push('/dashboard/syndic/interventions')} className="bg-black hover:bg-slate-800 rounded-xl px-6 h-12">
                            Assigner <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="alerts">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {alerts.map((alert) => (
                  <Card key={alert.id} className="border-2 border-red-100 bg-red-50/20 rounded-3xl group hover:border-red-400 transition-all">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <Badge className="bg-red-600 text-white px-3 font-bold">IOT ALERT</Badge>
                        <span className="text-xs font-mono text-red-400">{new Date(alert.date_detection).toLocaleString()}</span>
                      </div>
                      <CardTitle className="text-2xl font-black text-red-900 mt-4 uppercase">
                        {alert.type_seuil || "Anomalie Système"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-red-700 font-medium line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setSelectedAlert(alert)} className="flex-1 border-red-200 text-red-700 rounded-xl"><Eye className="mr-2 h-4 w-4"/> Détails</Button>
                        <Button onClick={() => router.push('/dashboard/syndic/interventions')} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md"><Wrench className="mr-2 h-4 w-4"/> Intervenir</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-t-8 border-t-red-600">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-2 text-red-900">
                  <AlertTriangle className="text-red-600"/> Détails IoT
                </DialogTitle>
                <DialogDescription className="italic font-medium">Analyse technique du capteur.</DialogDescription>
              </DialogHeader>
              <div className="bg-red-50 p-6 rounded-2xl space-y-6">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Message Système</label>
                   <p className="text-red-900 font-medium text-lg leading-relaxed">{selectedAlert?.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-red-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1">
                      <BarChart3 className="w-3 h-3"/> Compteur
                    </label>
                    <p className="text-red-800 font-mono font-bold text-lg">
                      {/* FIX : On utilise le nom exact de ton serializer */}
                      {selectedAlert?.compteur_reference || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">Niveau</label>
                    <p className="text-red-800 font-bold uppercase">Critique</p>
                  </div>
                </div>
              </div>
              <Button onClick={() => setSelectedAlert(null)} className="w-full h-12 rounded-xl bg-slate-900 mt-4 text-white hover:bg-slate-800">
                Fermer le rapport
              </Button>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}