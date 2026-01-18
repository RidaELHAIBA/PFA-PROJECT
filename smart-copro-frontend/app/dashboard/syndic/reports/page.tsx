"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { axiosInstance } from "@/lib/axios-config"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { 
  FileText, Download, FileBarChart, Calendar, 
  MapPin, Loader2, CheckCircle2, AlertCircle 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsManagement() {
  const [parties, setParties] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<any>(null)

  // Configuration du rapport - On utilise des strings pour la compatibilité Select
  const [config, setConfig] = useState({
    type_rapport: "Bilan Consommation",
    periode: "",
    format_export: "PDF",
    partie_commune_id: "" 
  })

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axiosInstance.get("/api/consumption/parties-communes/")
        setParties(res.data)
      } catch (err) { toast.error("Erreur de chargement des zones") }
    }
    fetchZones()
  }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    // Étape cruciale pour debug
    e.preventDefault()
    console.log("Tentative de génération avec config :", config)

    if (!config.periode || !config.partie_commune_id) {
      toast.error("Veuillez remplir la période (ex: 2025-12) et choisir une zone.")
      return
    }

    try {
      setIsGenerating(true)
      setGeneratedReport(null)
      
      // Préparation des données pour le backend (conversion ID en number)
      const payload = {
        ...config,
        partie_commune_id: parseInt(config.partie_commune_id)
      }

      // Appel direct à l'URL exacte du urls.py
      const res = await axiosInstance.post("/api/reports/rapports/generer/", payload)
      
      if (res.data.status === "success") {
        toast.success("Analyse terminée. Rapport disponible !")
        setGeneratedReport(res.data)
      }
    } catch (err: any) {
      console.error("Erreur Backend:", err.response?.data)
      toast.error("Échec de la génération : Vérifiez les données")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedReport) return
    try {
      const res = await axiosInstance.get(`/api/reports/rapports/telecharger/${generatedReport.rapport_id}/`, {
        responseType: 'blob' 
      })
      
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `rapport_copro_${config.periode}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success("Téléchargement démarré")
    } catch (err) {
      toast.error("Erreur lors de la récupération du fichier")
    }
  }

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-[#F8FAFC]">
        <SidebarNav />
        <main className="flex-1 ml-64 p-8 overflow-auto text-gray-900">
          
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Rapports & Audit</h1>
            <p className="text-slate-500 mt-2 text-lg italic">Génération et extraction des rapports de situation.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* PANNEAU GAUCHE : CONFIGURATION */}
            <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
              <CardHeader className="bg-slate-900 text-white p-8">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <FileBarChart className="w-8 h-8 text-blue-400" /> Paramètres d'Export
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {/* Suppression du type submit automatique pour debug manuel si besoin */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type de document</label>
                    <Select onValueChange={(v) => setConfig({...config, type_rapport: v})} defaultValue={config.type_rapport}>
                      <SelectTrigger className="h-14 rounded-2xl border-2 font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bilan Consommation">📊 Rapport de Consommation</SelectItem>
                        <SelectItem value="Situation Globale">🌍 Situation Globale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Période (Mois)</label>
                      <Input 
                        placeholder="2025-12" 
                        className="h-14 rounded-2xl border-2 font-bold"
                        value={config.periode}
                        onChange={(e) => setConfig({...config, periode: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Format</label>
                      <Select onValueChange={(v) => setConfig({...config, format_export: v})} defaultValue={config.format_export}>
                        <SelectTrigger className="h-14 rounded-2xl border-2 font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="PDF">Standard PDF</SelectItem><SelectItem value="EXCEL">Excel</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Infrastructure concernée</label>
                    <Select onValueChange={(v) => setConfig({...config, partie_commune_id: v})}>
                      <SelectTrigger className="h-14 rounded-2xl border-2 font-bold">
                        <SelectValue placeholder="Sélectionner une zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {parties.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleGenerate} // Déclenchement explicite au clic
                    disabled={isGenerating}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-lg transition-transform active:scale-95 uppercase tracking-widest"
                  >
                    {isGenerating ? <><Loader2 className="animate-spin mr-2"/> Compilation...</> : "Générer maintenant"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PANNEAU DROIT : RÉSULTAT */}
            <div className="flex flex-col gap-6">
              {!generatedReport ? (
                <Card className="border-2 border-dashed border-slate-200 rounded-[2rem] flex-1 flex flex-col items-center justify-center p-12 bg-slate-50/50">
                  <FileText className="w-20 h-20 text-slate-200 mb-6 animate-pulse" />
                  <p className="text-slate-400 font-bold text-lg">Prêt pour l'extraction.</p>
                </Card>
              ) : (
                <Card className="border-none shadow-2xl rounded-[2rem] bg-white animate-in zoom-in-95 duration-500">
                  <CardHeader className="p-10 pb-0">
                    <Badge className="bg-green-100 text-green-700 font-black px-4 py-1 border-none">RAPPORT PRÊT</Badge>
                    <CardTitle className="text-3xl font-black mt-4 uppercase">Traitement Terminé</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                         <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Stats calculées</p>
                           <p className="text-4xl font-black text-slate-900">{generatedReport.preview_stats?.valeur_moyenne?.toFixed(2)} U</p>
                         </div>
                         <CheckCircle2 className="text-green-500 w-12 h-12"/>
                    </div>
                    <Button onClick={handleDownload} className="w-full h-20 bg-black hover:bg-slate-800 text-white rounded-[1.5rem] font-black text-2xl flex items-center justify-center gap-4 transition-all">
                      TÉLÉCHARGER LE PDF <Download className="w-8 h-8 text-blue-400" />
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800 font-medium">Le document exporté contient l'analyse complète de la consommation et le suivi des interventions pour la période choisie.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}