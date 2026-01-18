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
  Loader2, Plus, MessageSquare, Zap, MapPin, Search,
  History as HistoryIcon, Send, CheckCircle2, AlertTriangle, Calendar 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProfileNav } from "@/components/profile-nav"

export default function ResidentDashboard() {
  const [claims, setClaims] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("") 
  
  const [zones, setZones] = useState<any[]>([])
  const [selectedZone, setSelectedZone] = useState<string>("") 
  const [lastReading, setLastReading] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])
  const [fetchingEnergy, setFetchingEnergy] = useState(false)

  const [newClaim, setNewClaim] = useState({ 
    description: "", 
    type_reclamation: "ELECTRICITE", 
    niveau_priorite: "BASSE" 
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [profileRes, claimsRes, zonesRes] = await Promise.all([
        axiosInstance.get("/api/users/profile/get_profile/"),
        axiosInstance.get("/api/claims/reclamations/"),
        axiosInstance.get("/api/consumption/parties-communes/")
      ])
      setProfile(profileRes.data)
      setClaims(Array.isArray(claimsRes.data) ? claimsRes.data : claimsRes.data.results || [])
      setZones(zonesRes.data)
    } catch (err) {
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (!selectedZone) {
      setLastReading(null)
      setAlerts([])
      return
    }
    const fetchEnergyData = async () => {
      setFetchingEnergy(true)
      try {
        const readingRes = await axiosInstance.get(`/api/consumption/releves/?zone_id=${selectedZone}&limit=1`)
        const readingData = readingRes.data.results || readingRes.data
        setLastReading(readingData[0] || null)

        const alertsRes = await axiosInstance.get(`/api/alerts/liste/?zone_id=${selectedZone}`)
        setAlerts(alertsRes.data.results || alertsRes.data)
      } catch (err) { console.error("Erreur energy data") }
      finally { setFetchingEnergy(false) }
    }
    fetchEnergyData()
  }, [selectedZone])

  const filteredClaims = claims.filter(c => 
    c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.type_reclamation.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axiosInstance.post("/api/claims/reclamations/", newClaim)
      toast.success("Signalement envoyé")
      setIsNewClaimOpen(false)
      setNewClaim({ description: "", type_reclamation: "ELECTRICITE", niveau_priorite: "BASSE" })
      fetchData()
    } catch (err) { toast.error("Erreur d'envoi") }
  }

  return (
    <ProtectedRoute requiredRole={["RESIDENT"]}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
        <ProfileNav userEmail={profile?.email || "Chargement..."} />
        
        <main className="p-8 max-w-6xl mx-auto">
          {/* HEADER COMPACT ET RAPPROCHÉ */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="flex flex-col gap-3">
              <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none">Mon Espace</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100">
                  <MapPin className="text-slate-400" size={14} />
                  <select 
                    className="bg-transparent font-bold text-[10px] outline-none pr-2 uppercase tracking-widest cursor-pointer"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                  >
                    <option value="">ZONE</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.nom}</option>)}
                  </select>
                </div>
                <Button 
                  onClick={() => setIsNewClaimOpen(true)} 
                  className="h-10 px-6 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-blue-600 transition-all flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Signalement
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <Card className="border-none shadow-sm bg-white p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute -top-4 -right-4 text-slate-50 opacity-50"><Zap size={140} /></div>
                <h2 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                   <Zap size={16} className="text-slate-900" /> Dernier Relevé
                </h2>
                {fetchingEnergy ? <Loader2 className="animate-spin" /> : lastReading ? (
                  <div>
                    <p className="text-6xl font-black tracking-tighter">{lastReading.valeur} <small className="text-xl font-bold italic">kWh</small></p>
                    <p className="mt-4 flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                       <Calendar size={12} /> Le {new Date(lastReading.date_releve).toLocaleDateString()}
                    </p>
                  </div>
                ) : <p className="text-slate-200 font-black italic">Aucune donnée</p>}
              </Card>

              <div className="space-y-3">
                <h2 className="font-black uppercase text-[10px] tracking-widest text-slate-400 ml-4 mb-2 text-slate-400">Alertes Consommation</h2>
                {alerts.length > 0 ? alerts.map((a: any) => (
                  <Card key={a.id} className="border-none bg-white p-5 rounded-2xl border-l-4 border-red-600 shadow-sm transition-all hover:bg-red-50/50">
                    <div className="flex gap-4">
                      <AlertTriangle className="text-red-600 shrink-0" size={20} />
                      <div>
                        <p className="font-bold text-[11px] leading-tight text-slate-900 italic mb-1">"{a.description}"</p>
                        <p className="text-[9px] font-black text-slate-300 mt-2 uppercase flex items-center gap-1">
                          <Calendar size={10} /> {new Date(a.date_detection).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <Card className="border-none bg-green-50 p-6 rounded-[2rem] text-green-700 font-bold text-[10px] flex items-center gap-3">
                    <CheckCircle2 size={16} /> Consommation sous contrôle
                  </Card>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-4">
                <h2 className="font-black uppercase text-[10px] tracking-widest text-slate-400 flex items-center gap-3">
                  <HistoryIcon className="w-5 h-5 text-slate-300" /> Suivi des demandes
                </h2>
                
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-2.5 h-3 w-3 text-slate-400" />
                  <Input 
                    placeholder="Filtrer par texte ou type..."
                    className="pl-10 h-8 rounded-lg border-none bg-white shadow-sm text-[10px] font-bold"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? <Loader2 className="animate-spin mx-auto mt-10" /> : filteredClaims.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-200 font-black uppercase tracking-widest text-xs">Aucune réclamation trouvée</div>
              ) : (
                <div className="space-y-4">
                  {filteredClaims.map((c) => (
                    <Card key={c.id} className={`border-none shadow-sm rounded-[2rem] transition-all hover:shadow-md ${c.statut === 'RESOLUE' ? 'bg-slate-50 opacity-60' : 'bg-white'}`}>
                      <CardContent className="p-8 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${c.statut === 'RESOLUE' ? 'bg-green-100 text-green-600' : 'bg-slate-900 text-white'}`}>
                            {c.statut === 'RESOLUE' ? <CheckCircle2 size={20} /> : <MessageSquare size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] px-2 tracking-wider uppercase">{c.type_reclamation}</Badge>
                              {/* AFFICHAGE DE LA DATE DANS LA LISTE */}
                              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={10} /> {new Date(c.date_soumission).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className={`font-black text-lg tracking-tight ${c.statut === 'RESOLUE' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{c.description}</h3>
                          </div>
                        </div>
                        <p className={`font-black text-[9px] uppercase tracking-widest ${c.statut === 'RESOLUE' ? 'text-green-500 font-black' : 'text-blue-600'}`}>{c.statut}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Dialog open={isNewClaimOpen} onOpenChange={setIsNewClaimOpen}>
            <DialogContent className="rounded-[2.5rem] p-10 max-w-lg border-none">
              <DialogHeader><DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Réclamation</DialogTitle></DialogHeader>
              <form onSubmit={handleCreateClaim} className="space-y-5 pt-2">
                <select className="w-full h-11 rounded-xl border border-slate-200 px-4 font-bold text-sm outline-none focus:border-slate-900" 
                  value={newClaim.type_reclamation} onChange={e => setNewClaim({...newClaim, type_reclamation: e.target.value})}>
                  <option value="ELECTRICITE">Électricité</option>
                  <option value="ASCENSEUR">Ascenseur</option>
                  <option value="AUTRE">Autre</option>
                </select>
                <Textarea placeholder="Décrivez le problème..." className="min-h-[100px] rounded-xl p-4 border border-slate-200 outline-none focus:border-slate-900 text-sm"
                  value={newClaim.description} onChange={e => setNewClaim({...newClaim, description: e.target.value})} required />
                <Button type="submit" className="w-full h-14 bg-slate-900 text-white font-black rounded-xl uppercase tracking-widest hover:bg-black transition-colors text-sm">Envoyer</Button>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  )
}