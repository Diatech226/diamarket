'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function VendorApplyPage(){
  const [form,setForm]=useState({shopName:'',country:'',city:'',phone:'',description:''}); const [status,setStatus]=useState('');
  const submit = async(e: React.FormEvent)=>{ e.preventDefault(); const res = await api.submitVendorRequest(form); setStatus(res.status); };
  return <form onSubmit={submit} className='mx-auto max-w-xl space-y-3 rounded bg-white p-6 shadow'><h1 className='text-2xl font-bold'>Demande compte vendeur</h1>{Object.entries(form).map(([k,v])=><input key={k} className='w-full rounded border p-2' placeholder={k} value={v} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<button className='rounded bg-black px-4 py-2 text-white'>Envoyer</button>{status && <p>Statut demande: {status}</p>}</form>;
}
