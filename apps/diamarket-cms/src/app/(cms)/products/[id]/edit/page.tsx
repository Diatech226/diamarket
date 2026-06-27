import { ProductForm } from "@/components/products";
export default function EditProductPage({ params }: { params: { id: string } }) { return <div className="space-y-6"><div><p className="text-sm uppercase tracking-[0.3em] text-amber-700">Produits</p><h1 className="text-3xl font-semibold">Éditer le produit {params.id}</h1></div><ProductForm mode="edit" /></div>; }
