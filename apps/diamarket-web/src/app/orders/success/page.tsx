import Link from 'next/link';

export default function OrderSuccessPage({ searchParams }: { searchParams: { orderId?: string } }) {
  return <div className='mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm'><p className='text-sm font-semibold text-emerald-700'>Paiement Diapay reçu</p><h1 className='mt-2 text-3xl font-bold'>Merci, votre paiement est en cours de confirmation.</h1><p className='mt-3 text-slate-600'>Diamarket confirme définitivement la commande uniquement après webhook Diapay vérifié côté serveur.</p>{searchParams.orderId && <Link className='mt-5 inline-block rounded-full bg-black px-5 py-3 text-white' href={`/orders/${searchParams.orderId}/payment`}>Voir le statut paiement</Link>}</div>;
}
