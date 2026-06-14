"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { cmsService } from "@/services/cms-service";

type Stats = { products:number; orders:number; users:number; vendors:number; revenue:number; pendingOrders:number; pendingVendorRequests:number; lowStock:number };
export default function DashboardPage() {
  const [stats,setStats]=useState<Stats|null>(null); const [error,setError]=useState("");
  useEffect(()=>{cmsService.getDashboard().then((r:any)=>setStats(r.stats)).catch((e)=>setError(e.message));},[]);
  return <div className="space-y-6"><PageHeader title="Dashboard admin" subtitle="Indicateurs réels de la marketplace" />
    {error&&<p className="rounded-xl bg-red-500/10 p-3 text-red-700">{error}</p>}
    {!stats?<p className="text-zinc-500">Chargement des indicateurs…</p>:<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Produits" value={stats.products}/><StatCard label="Commandes" value={stats.orders}/><StatCard label="Commandes en attente" value={stats.pendingOrders}/><StatCard label="Vendeurs" value={stats.vendors}/><StatCard label="Demandes vendeur" value={stats.pendingVendorRequests}/><StatCard label="Utilisateurs" value={stats.users}/><StatCard label="Chiffre d’affaires" value={`${stats.revenue.toLocaleString("fr-FR")} FCFA`}/><StatCard label="Alertes stock faible" value={stats.lowStock}/>
    </div>}</div>;
}
