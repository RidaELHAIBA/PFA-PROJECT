"use client"

import { useState, useEffect, useMemo } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  Loader2, Building2, Gauge, Plus, Trash2, Edit2, Search,
  Droplets, Zap, Activity, Save, ShieldAlert, AlertCircle, MessageSquare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

export default function InfrastructureManagement() {
  const [parties, setParties] = useState<any[]>([])
  const [compteurs, setCompteurs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ÉTAT POUR LA RECHERCHE
  const [searchTerm, setSearchTerm] = useState("")

  const [isAddingZone, setIsAddingZone] = useState(false)
  const [editingZone, setEditingZone] = useState<any>(null)
  const [isAddingCompteur, setIsAddingCompteur] = useState(false)
  const [editingCompteur, setEditingCompteur] = useState<any>(null)
  const [selectedCompteurForReleve, setSelectedCompteurForReleve] = useState<any>(null)
  
  const [deletingCompteurId, setDeletingCompteurId] = useState<number | null>(null)
  const [deletingZoneId, setDeletingZoneId] = useState<number | null>(null)

  const [zoneForm, setZoneForm] = useState({ nom: "", surface: 0 })
  const [compteurForm, setCompteurForm] = useState({
    reference: "", localisation: "", date_installation: "", 
    type_compteur: "Eau", etat_compteur: "Actif", seuil_alerte: 200, partie_commune: ""
  })
  const [releveForm, setReleveForm] = useState({
    compteur_reference: "", valeur: 0, 
    date_releve: new Date().toISOString().slice(0, 16), 
    commentaire: "" 
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const [zonesRes, compRes] = await Promise.all([
        axiosInstance.get("/api/consumption/parties-communes/"),
        axiosInstance.get("/api/consumption/compteurs/")
      ])
      setParties(zonesRes.data)
      setCompteurs(compRes.data)
    } catch (err) { toast.error("Erreur réseau") }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  // LOGIQUE DE FILTRAGE
  const filteredParties = parties.filter(p => 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCompteurs = compteurs.filter(c => 
    c.localisation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaisieReleve = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await axiosInstance.post("/api/consumption/releves/saisie/", releveForm)
      if (res.data.alerte_generee) {
        toast.warning("ALERTE : Seuil de consommation dépassé !")
      } else {
        toast.success("Relevé archivé avec succès")
      }
      setSelectedCompteurForReleve(null)
      setReleveForm({ compteur_reference: "", valeur: 0, date_releve: new Date().toISOString().slice(0, 16), commentaire: "" })
    } catch (err) { toast.error("Erreur de saisie") }
  }

  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      editingZone 
        ? await axiosInstance.put(`/api/consumption/parties-communes/${editingZone.id}/`, zoneForm)
        : await axiosInstance.post("/api/consumption/parties-communes/", zoneForm)
      setIsAddingZone(false); setEditingZone(null); fetchData()
      toast.success("Zone enregistrée")
    } catch (err) { toast.error("Erreur") }
  }

  const handleCompteurSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      editingCompteur
        ? await axiosInstance.put(`/api/consumption/compteurs/${editingCompteur.id}/`, compteurForm)
        : await axiosInstance.post("/api/consumption/compteurs/", compteurForm)
      setIsAddingCompteur(false); setEditingCompteur(null); fetchData()
      toast.success("Compteur configuré")
    } catch (err) { toast.error("Erreur") }
  }

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-[#F8FAFC]">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 overflow-auto text-gray-900">
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Infrastructure & IoT</h1>
              <p className="text-slate-500 mt-2 text-lg italic">Suivi technique des équipements de la copropriété.</p>
            </div>
            
            {/* TA BARRE DE RECHERCHE AJOUTÉE ICI */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Filtrer..." 
                  className="pl-10 w-64 rounded-xl bg-white border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                 <Button onClick={() => setIsAddingZone(true)} variant="outline" className="border-2 rounded-xl h-12 font-bold hover:bg-white"><Plus className="mr-2 h-4 w-4"/> Zone</Button>
                 <Button onClick={() => setIsAddingCompteur(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-6 font-bold shadow-lg"><Plus className="mr-2 h-4 w-4"/> Installer Compteur</Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="zones">
            <TabsList className="bg-white border p-1 rounded-xl mb-8 shadow-sm">
              <TabsTrigger value="zones" className="px-8 font-bold data-[state=active]:bg-black data-[state=active]:text-white">Zones</TabsTrigger>
              <TabsTrigger value="compteurs" className="px-8 font-bold data-[state=active]:bg-black data-[state=active]:text-white">Compteurs</TabsTrigger>
            </TabsList>

            <TabsContent value="zones" className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
              {filteredParties.map((zone) => (
                <Card key={zone.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl bg-white group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-black group-hover:text-white transition-all"><Building2 className="w-6 h-6"/></div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => {setEditingZone(zone); setZoneForm(zone); setIsAddingZone(true)}}><Edit2 className="w-4 h-4 text-blue-600"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingZoneId(zone.id)}><Trash2 className="w-4 h-4 text-red-600"/></Button>
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{zone.nom}</h3>
                    <div className="mt-4 flex justify-between items-center text-sm font-bold text-slate-400">
                      <span>{zone.surface} m²</span>
                      <Badge className="bg-slate-50 text-slate-500 border-none font-bold">{compteurs.filter(c => c.partie_commune === zone.id).length} capteurs</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="compteurs" className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              {filteredCompteurs.map((comp) => (
                <Card key={comp.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl bg-white group">
                  <CardContent className="p-6 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border-2 transition-colors ${comp.type_compteur === 'Eau' ? 'border-blue-100 bg-blue-50 text-blue-600' : 'border-amber-100 bg-amber-50 text-amber-600'}`}>
                        {comp.type_compteur === 'Eau' ? <Droplets /> : <Zap />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400 uppercase">REF: {comp.reference}</span>
                          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold">{comp.nom_zone}</Badge>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mt-1 uppercase">{comp.localisation}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right flex flex-col items-end">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-red-400" /> Seuil
                        </label>
                        <span className="text-xl font-black text-red-600 italic">
                          {comp.seuil_alerte} <small className="text-[10px] uppercase font-bold text-red-400">U</small>
                        </span>
                      </div>

                      <Button 
                        onClick={() => {
                          setSelectedCompteurForReleve(comp);
                          setReleveForm({...releveForm, compteur_reference: comp.reference, valeur: 0, commentaire: ""});
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 h-11 shadow-lg"
                      >
                        <Activity className="w-4 h-4 mr-2" /> Saisir un relevé
                      </Button>
                      
                      <div className="flex gap-1 border-l pl-6 border-slate-100">
                        <Button variant="ghost" size="icon" onClick={() => {setEditingCompteur(comp); setCompteurForm(comp); setIsAddingCompteur(true)}} className="rounded-xl h-10 w-10"><Edit2 className="w-4 h-4 text-blue-600"/></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingCompteurId(comp.id)} className="rounded-xl h-10 w-10 hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-600"/></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* ... TOUTES TES MODALES RESTENT IDENTIQUES CI-DESSOUS ... */}
          <Dialog open={!!selectedCompteurForReleve} onOpenChange={() => setSelectedCompteurForReleve(null)}>
            <DialogContent className="rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
              <div className="bg-blue-600 p-8 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black flex items-center gap-3 uppercase italic">
                    <Gauge className="w-8 h-8" /> Saisir un relevé
                  </DialogTitle>
                  <p className="opacity-80 font-bold tracking-widest text-xs mt-2 uppercase">Compteur : {selectedCompteurForReleve?.reference}</p>
                </DialogHeader>
              </div>
              <form onSubmit={handleSaisieReleve} className="p-8 space-y-6 bg-white font-bold">
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex justify-between items-center">
                    <span className="text-xs font-black text-red-400 uppercase">Seuil critique</span>
                    <span className="text-lg font-black text-red-600">{selectedCompteurForReleve?.seuil_alerte} U</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouvelle Valeur</label>
                    <Input type="number" step="0.01" className="h-14 text-2xl font-black rounded-2xl border-2 border-slate-100 focus:border-blue-500 transition-all" 
                      onChange={e => setReleveForm({...releveForm, valeur: parseFloat(e.target.value)})} required autoFocus />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Note / Commentaire
                    </label>
                    <Input 
                      placeholder="Commentaire..." 
                      className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50 focus:bg-white transition-all font-medium italic"
                      value={releveForm.commentaire}
                      onChange={e => setReleveForm({...releveForm, commentaire: e.target.value})} 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-xl uppercase">
                  <Save className="mr-2 h-5 w-5"/> Archiver
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* ... DIALOGS ZONE ET COMPTEUR IDENTIQUES ... */}
          <Dialog open={isAddingZone} onOpenChange={() => {setIsAddingZone(false); setEditingZone(null)}}>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle className="text-2xl font-black italic">{editingZone ? "Modifier" : "Nouvelle"} Zone</DialogTitle></DialogHeader>
              <form onSubmit={handleZoneSubmit} className="space-y-4 pt-4 font-bold">
                <Input placeholder="Nom" value={zoneForm.nom} onChange={e => setZoneForm({...zoneForm, nom: e.target.value})} required className="rounded-xl h-12" />
                <Input type="number" placeholder="Surface m²" value={zoneForm.surface} onChange={e => setZoneForm({...zoneForm, surface: parseFloat(e.target.value)})} required className="rounded-xl h-12" />
                <Button type="submit" className="w-full h-12 bg-black text-white font-black rounded-xl mt-4">Sauvegarder</Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddingCompteur} onOpenChange={() => {setIsAddingCompteur(false); setEditingCompteur(null)}}>
            <DialogContent className="rounded-[2.5rem] max-w-2xl p-10">
              <DialogHeader><DialogTitle className="text-3xl font-black uppercase tracking-tighter">Configuration Matériel</DialogTitle></DialogHeader>
              <form onSubmit={handleCompteurSubmit} className="grid grid-cols-2 gap-6 pt-6 font-bold">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Référence</label><Input value={compteurForm.reference} onChange={e => setCompteurForm({...compteurForm, reference: e.target.value})} required className="rounded-2xl h-14 font-mono text-lg border-2" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Localisation</label><Input value={compteurForm.localisation} onChange={e => setCompteurForm({...compteurForm, localisation: e.target.value})} required className="rounded-2xl h-14 border-2" /></div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Énergie</label>
                  <Select onValueChange={(val) => setCompteurForm({...compteurForm, type_compteur: val})} defaultValue={compteurForm.type_compteur}>
                    <SelectTrigger className="h-14 rounded-2xl border-2"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl"><SelectItem value="Eau">💧 Eau</SelectItem><SelectItem value="Electricité">⚡ Électricité</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Zone</label>
                  <Select onValueChange={(val) => setCompteurForm({...compteurForm, partie_commune: val})} defaultValue={compteurForm.partie_commune?.toString()}>
                    <SelectTrigger className="h-14 rounded-2xl border-2"><SelectValue placeholder="Zone" /></SelectTrigger>
                    <SelectContent className="rounded-xl">{parties.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.nom}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Date Installation</label><Input type="date" value={compteurForm.date_installation} onChange={e => setCompteurForm({...compteurForm, date_installation: e.target.value})} required className="rounded-2xl h-14 border-2" /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase">Seuil Critique</label><Input type="number" value={compteurForm.seuil_alerte} onChange={e => setCompteurForm({...compteurForm, seuil_alerte: parseFloat(e.target.value)})} required className="rounded-2xl h-14 text-red-600 font-black border-2 border-red-100" /></div>
                <Button type="submit" className="col-span-2 h-16 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl shadow-xl mt-4 uppercase">Valider l'installation</Button>
              </form>
            </DialogContent>
          </Dialog>

        </main>
      </div>
    </ProtectedRoute>
  )
}