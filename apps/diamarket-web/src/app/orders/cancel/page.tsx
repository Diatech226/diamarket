import Link from 'next/link';

export default function OrderCancelPage({ searchParams }: { searchParams: { orderId?: string } }) {
  return <div className='mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-sm'><p className='text-sm font-semibold text-amber-700'>Paiement annulé ou échoué</p><h1 className='mt-2 text-3xl font-bold'>Votre commande n’a pas encore été payée.</h1><p className='mt-3 text-slate-600'>Vous pouvez réessayer Diapay ou choisir le paiement à la livraison si disponible.</p>{searchParams.orderId ? <Link className='mt-5 inline-block rounded-full bg-black px-5 py-3 text-white' href={`/orders/${searchParams.orderId}/payment`}>Réessayer / vérifier</Link> : <Link className='mt-5 inline-block rounded-full bg-black px-5 py-3 text-white' href='/checkout'>Retour checkout</Link>}</div>;
}
