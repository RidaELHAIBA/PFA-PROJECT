"use client"

import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/sidebar-nav"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { axiosInstance } from "@/lib/axios-config"
import { toast } from "sonner"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import { Loader2, Users, Wrench, Building2, ShieldAlert, Activity, Gauge } from "lucide-react"

export default function SyndicDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.get("/api/reports/dashboard/")
        setData(response.data)
      } catch (err: any) {
        toast.error("Erreur de synchronisation des statistiques")
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <ProtectedRoute requiredRole={["SYNDIC"]}>
      <div className="flex h-screen bg-[#F8FAFC]">
        <SidebarNav />
        <main className="flex-1 ml-0 md:ml-64 overflow-auto p-8 space-y-8 text-gray-900">
          <div className="mb-6">
             <h1 className="text-4xl font-black text-slate-900 tracking-tight">Vue d'ensemble</h1>
             <p className="text-slate-500 italic">État global de la copropriété et des systèmes IoT.</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
            </div>
          ) : data ? (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Population</CardTitle>
                    <Users className="w-5 h-5 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black">{data.communaute?.habitants || 0}</div>
                    <p className="text-xs text-slate-400 mt-1">Résidents actifs</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Maintenance</CardTitle>
                    <Wrench className="w-5 h-5 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-orange-600">{data.maintenance?.reclamations_ouvertes || 0}</div>
                    <p className="text-xs text-slate-400 mt-1">Réclamations en attente</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alertes IoT</CardTitle>
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-red-600">{data.maintenance?.alertes_critiques || 0}</div>
                    <p className="text-xs text-slate-400 mt-1">Dépassements de seuils</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-2xl bg-white">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interventions</CardTitle>
                    <Activity className="w-5 h-5 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-black text-green-600">{data.maintenance?.interventions_en_cours || 0}</div>
                    <p className="text-xs text-slate-400 mt-1">Missions assignées</p>
                  </CardContent>
                </Card>
              </div>

              {/* INFRASTRUCTURE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-slate-100 rounded-2xl"><Building2 className="w-8 h-8 text-slate-600"/></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Parties Communes</p>
                            <p className="text-3xl font-black text-slate-900">{data.infrastructure?.parties_communes || 0}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-sm rounded-2xl bg-white p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-50 rounded-2xl"><Gauge className="w-8 h-8 text-blue-600"/></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Compteurs IoT</p>
                            <p className="text-3xl font-black text-slate-900">{data.infrastructure?.total_compteurs || 0}</p>
                        </div>
                    </div>
                </Card>
              </div>

              {/* GRAPHIQUES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-sm rounded-3xl p-4 bg-white">
                  <CardHeader><CardTitle className="text-lg font-bold">Efficacité Maintenance</CardTitle></CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { name: "Résolues", value: data.maintenance?.taux_resolution || 0 },
                            { name: "En cours", value: 100 - (data.maintenance?.taux_resolution || 0) }
                          ]} 
                          dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5}
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f1f5f9" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center mt-[-180px] mb-[150px]">
                        <p className="text-4xl font-black text-slate-900">{data.maintenance?.taux_resolution}%</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Succès</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl p-4 bg-white">
                  <CardHeader><CardTitle className="text-lg font-bold">Répartition Population</CardTitle></CardHeader>
                  <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={[{ name: "Global", "Résidents": data.communaute?.habitants, "Staff": data.communaute?.staff_technique }]}
                        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        barCategoryGap="30%" // Règle le problème d'espace sur les côtés
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} />
                        <Legend iconType="circle" />
                        <Bar dataKey="Résidents" fill="#3b82f6" radius={[10, 10, 0, 0]} />
                        <Bar dataKey="Staff" fill="#f59e0b" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 py-20 bg-white rounded-3xl border-2 border-dashed">Données indisponibles.</div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}