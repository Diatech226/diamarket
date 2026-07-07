import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  BarChart3, Package, ShoppingCart, RefreshCcw, HelpCircle, 
  ChevronRight, ArrowLeft, Search, Eye, Edit2, AlertCircle, 
  Check, X, FileText, Send, Plus, Trash2, ShieldCheck, Mail, Phone
} from "lucide-react";
import { Screen, Product, Order, ReturnRequest, FAQItem } from "../types";

interface SellerScreenProps {
  onNavigate: (screen: Screen) => void;
  products: Product[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onAddProduct: (product: Product) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  returns: ReturnRequest[];
  onUpdateReturnStatus: (returnId: string, status: ReturnRequest["status"], comment?: string) => void;
  selectedReturn: ReturnRequest | null;
  onSelectReturn: (ret: ReturnRequest) => void;
  faqs: FAQItem[];
  onAddFAQ: (faq: FAQItem) => void;
}

// 16. TABLEAU DE BORD VENDEUR
export const TableauDeBordVendeurScreen: React.FC<SellerScreenProps> = ({
  onNavigate,
  products,
  orders,
  returns
}) => {
  const totalSales = orders.filter(o => o.status !== "Annulé").reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "En attente").length;
  const activeReturns = returns.filter(r => r.status === "En attente").length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;

  // Simple statistics lists for visualizations
  const recentOrders = orders.slice(0, 3);
  const alertInventory = products.filter(p => p.stock <= 10).slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-tableau-vendeur"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Espace Vendeur - AuraMarket</h1>
          <p className="text-sm text-slate-500">Supervisez l'activité de votre boutique, l'inventaire et les retours clients</p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Chiffre d'Affaires", value: `${Math.round(totalSales)} €`, desc: "Ventes cumulées", color: "from-violet-500 to-brand-600 text-white shadow-brand-500/15", icon: BarChart3 },
          { title: "Commandes en attente", value: pendingOrders, desc: "À préparer & expédier", color: "from-amber-500 to-orange-600 text-white shadow-amber-500/15", icon: ShoppingCart },
          { title: "Retours en cours", value: activeReturns, desc: "Demandes à valider", color: "from-rose-500 to-pink-600 text-white shadow-rose-500/15", icon: RefreshCcw },
          { title: "Alertes Stocks", value: outOfStockProducts, desc: `${lowStockProducts} produits presque épuisés`, color: "from-slate-800 to-slate-950 text-white shadow-slate-950/10", icon: Package }
        ].map((stat, i) => (
          <div 
            key={i}
            className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg space-y-4`}
          >
            <div className="flex justify-between items-center opacity-90">
              <span className="text-xs font-semibold uppercase tracking-wider">{stat.title}</span>
              <stat.icon className="w-5 h-5 opacity-80" />
            </div>
            <div>
              <h3 className="font-display text-3xl font-black">{stat.value}</h3>
              <p className="text-[11px] opacity-75 pt-1">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Access Menu Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: "Gestion des Commandes", desc: "Suivez l'état des livraisons, modifiez les statuts de préparation.", route: Screen.GestionCommandes, bg: "bg-blue-50 border-blue-100 text-blue-800", count: orders.length },
          { title: "Gestion de l'Inventaire", desc: "Éditez vos fiches produits, modifiez vos stocks et ajoutez des articles.", route: Screen.GestionInventaire, bg: "bg-emerald-50 border-emerald-100 text-emerald-800", count: products.length },
          { title: "Gestion des Retours", desc: "Gérez les remboursements et les contestations pour retours défectueux.", route: Screen.GestionRetours, bg: "bg-rose-50 border-rose-100 text-rose-800", count: returns.length }
        ].map((item, i) => (
          <div 
            key={i}
            onClick={() => onNavigate(item.route)}
            className="p-6 rounded-3xl border bg-white hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${item.bg}`}>
                  {item.count} enregistrements
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
              <p className="text-slate-500 text-xs font-light leading-relaxed">{item.desc}</p>
            </div>
            <span className="text-xs font-semibold text-brand-600 flex items-center gap-1 group-hover:underline">
              Ouvrir l'outil de gestion
            </span>
          </div>
        ))}
      </div>

      {/* Charts & Quick Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales visualization block */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-base">Évolution des ventes (Semaine en cours)</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
              +14.2% vs semaine passée
            </span>
          </div>

          {/* Simple Vector Graph Bar */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4">
            {[
              { day: "Lun", val: 120, h: "h-[30%]" },
              { day: "Mar", val: 340, h: "h-[60%]" },
              { day: "Mer", val: 190, h: "h-[45%]" },
              { day: "Jeu", val: 560, h: "h-[85%]" },
              { day: "Ven", val: 420, h: "h-[75%]" },
              { day: "Sam", val: 680, h: "h-[100%]" },
              { day: "Dim", val: 240, h: "h-[50%]" }
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full relative flex flex-col items-center">
                  {/* Tooltip value */}
                  <span className="absolute -top-7 opacity-0 group-hover:opacity-100 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded transition-opacity font-bold whitespace-nowrap">
                    {d.val} €
                  </span>
                  <div className={`w-full rounded-lg bg-slate-100 group-hover:bg-brand-500 transition-all ${d.h}`} />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low inventory alerts list */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Alertes d'approvisionnement
          </h3>
          <div className="divide-y divide-slate-50">
            {alertInventory.map(p => (
              <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 truncate">{p.name}</h4>
                  <span className="text-slate-400">Catégorie : {p.category}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold ${p.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                  {p.stock} restants
                </span>
              </div>
            ))}
          </div>
          <button 
            onClick={() => onNavigate(Screen.GestionInventaire)}
            className="w-full text-center text-xs font-semibold text-brand-600 hover:text-brand-700 pt-2 block"
          >
            Gérer tout le stock d'articles
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// 3. GESTION DES COMMANDES - VENDEUR
export const GestionCommandesScreen: React.FC<SellerScreenProps> = ({
  onNavigate,
  orders,
  onSelectOrder
}) => {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");

  const filtered = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || 
                          o.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "Tous" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-gestion-commandes"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Gestion des Commandes</h1>
          <p className="text-sm text-slate-500">Contrôlez les factures et mettez à jour les statuts de livraison</p>
        </div>
        <button 
          onClick={() => onNavigate(Screen.TableauDeBordVendeur)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Tableau de Bord
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher par ID commande ou nom client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-3 px-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm text-slate-700"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="En attente">En attente</option>
              <option value="Préparé">Préparé</option>
              <option value="Expédié">Expédié</option>
              <option value="Livré">Livré</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 md:p-5">ID Commande</th>
                <th className="p-4 md:p-5">Client</th>
                <th className="p-4 md:p-5">Date</th>
                <th className="p-4 md:p-5">Articles</th>
                <th className="p-4 md:p-5">Montant Total</th>
                <th className="p-4 md:p-5">Statut</th>
                <th className="p-4 md:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 md:p-5 font-mono font-bold text-slate-900">{order.id}</td>
                  <td className="p-4 md:p-5">
                    <div className="font-semibold text-slate-800">{order.customerName}</div>
                    <div className="text-[10px] text-slate-400">{order.email}</div>
                  </td>
                  <td className="p-4 md:p-5">{order.date}</td>
                  <td className="p-4 md:p-5 font-medium">{order.items.reduce((sum, i) => sum + i.quantity, 0)} articles</td>
                  <td className="p-4 md:p-5 font-extrabold text-slate-900">{order.total} €</td>
                  <td className="p-4 md:p-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      order.status === "Livré" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      order.status === "Expédié" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      order.status === "Préparé" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      order.status === "Annulé" ? "bg-red-50 text-red-700 border border-red-100" :
                      "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 md:p-5 text-right">
                    <button 
                      onClick={() => { onSelectOrder(order); onNavigate(Screen.DetailsCommande); }}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <Eye className="w-4 h-4" />
                      Détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            Aucune commande trouvée.
          </div>
        )}
      </div>
    </motion.div>
  );
};

// 12. DÉTAILS DE LA COMMANDE - VENDEUR
export const DetailsCommandeScreen: React.FC<SellerScreenProps> = ({
  onNavigate,
  selectedOrder,
  onUpdateOrderStatus
}) => {
  const [activeStatus, setActiveStatus] = useState<Order["status"]>(selectedOrder?.status || "En attente");

  if (!selectedOrder) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl">
        <ArrowLeft className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Aucune commande sélectionnée</h3>
        <button onClick={() => onNavigate(Screen.GestionCommandes)} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl">
          Liste des commandes
        </button>
      </div>
    );
  }

  const handleStatusChange = (status: Order["status"]) => {
    setActiveStatus(status);
    onUpdateOrderStatus(selectedOrder.id, status);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-16"
      id="screen-details-commande"
    >
      <button 
        onClick={() => onNavigate(Screen.GestionCommandes)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retourner à la gestion des commandes
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Order billing and status update */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-50 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID FACTURE</span>
              <h2 className="font-mono text-lg font-bold text-slate-800">{selectedOrder.id}</h2>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DATE DE CRÉATION</span>
              <p className="text-slate-700 text-xs font-semibold">{selectedOrder.date}</p>
            </div>
          </div>

          {/* List items ordered */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Articles commandés</h3>
            <div className="divide-y divide-slate-50">
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs md:text-sm">
                  <div className="flex gap-3 items-center min-w-0">
                    <img 
                      src={it.product.image} 
                      alt={it.product.name} 
                      className="w-10 h-10 rounded-lg object-cover border"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{it.product.name}</h4>
                      <p className="text-[10px] text-slate-400">PU: {it.product.price} €</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-medium text-slate-500">x{it.quantity}</span>
                    <p className="font-bold text-slate-900 ml-4 inline-block">{it.price * it.quantity} €</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Computation info */}
          <div className="border-t border-slate-50 pt-4 flex flex-col items-end text-xs space-y-2">
            <div className="flex justify-between w-48 text-slate-500">
              <span>Sous-total :</span>
              <span>{selectedOrder.subtotal} €</span>
            </div>
            <div className="flex justify-between w-48 text-slate-500">
              <span>Frais de port :</span>
              <span>{selectedOrder.shippingCost === 0 ? "Gratuit" : `${selectedOrder.shippingCost} €`}</span>
            </div>
            <div className="flex justify-between w-48 font-bold text-slate-950 text-sm pt-2 border-t border-slate-100">
              <span>Montant Facturé :</span>
              <span>{selectedOrder.total} €</span>
            </div>
          </div>
        </div>

        {/* Change status and customer info */}
        <div className="space-y-6">
          {/* Status edit panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Mise à jour du statut</h3>
            <div className="grid grid-cols-1 gap-2">
              {["En attente", "Préparé", "Expédié", "Livré", "Annulé"].map((st) => (
                <button 
                  key={st}
                  onClick={() => handleStatusChange(st as any)}
                  className={`w-full py-2.5 px-3 rounded-xl text-left text-xs font-semibold border flex items-center justify-between transition-all ${
                    activeStatus === st ? "bg-brand-600 border-brand-600 text-white shadow-sm" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <span>{st}</span>
                  {activeStatus === st && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Destinataire & Facturation</h3>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-400 block">Nom complet</span>
                <span className="font-semibold text-slate-800">{selectedOrder.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Coordonnées</span>
                <span className="font-semibold text-slate-800">{selectedOrder.email}</span>
                <span className="text-slate-400 block pt-0.5">{selectedOrder.phone}</span>
              </div>
              <div className="pt-1.5 border-t border-slate-50">
                <span className="text-slate-400 block">Adresse de livraison</span>
                <p className="font-semibold text-slate-800 leading-tight">{selectedOrder.deliveryAddress.street}</p>
                <p className="font-semibold text-slate-800">{selectedOrder.deliveryAddress.postalCode} {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 17. GESTION DE L'INVENTAIRE - VENDEUR
export const GestionInventaireScreen: React.FC<SellerScreenProps> = ({
  onNavigate,
  products,
  onUpdateProductStock,
  onAddProduct
}) => {
  const [search, setSearch] = useState("");
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState(0);

  // Modal to add products
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState(50);
  const [newProdCat, setNewProdCat] = useState("Électronique");
  const [newProdStock, setNewProdStock] = useState(10);
  const [newProdDesc, setNewProdDesc] = useState("");

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleStartStockEdit = (product: Product) => {
    setStockEditId(product.id);
    setTempStockValue(product.stock);
  };

  const handleSaveStock = (productId: string) => {
    onUpdateProductStock(productId, tempStockValue);
    setStockEditId(null);
  };

  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      description: newProdDesc || "Aucune description fournie.",
      price: newProdPrice,
      rating: 5.0,
      reviewsCount: 1,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      category: newProdCat,
      stock: newProdStock,
      isElectronic: newProdCat === "Électronique",
      features: ["Équipement de qualité AuraMarket"],
      specs: { "Garantie": "2 ans", "Marque": "Aura" }
    };

    onAddProduct(newProd);
    setShowAddModal(false);
    // Reset form
    setNewProdName("");
    setNewProdPrice(50);
    setNewProdDesc("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16 relative"
      id="screen-gestion-inventaire"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Gestion de l'Inventaire</h1>
          <p className="text-sm text-slate-500">Gérez le niveau des stocks d'articles et ajoutez de nouvelles références</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/10"
          >
            <Plus className="w-4 h-4" />
            Nouveau Produit
          </button>
          <button 
            onClick={() => onNavigate(Screen.TableauDeBordVendeur)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par référence, nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 md:p-5">Réf</th>
                <th className="p-4 md:p-5">Visuel</th>
                <th className="p-4 md:p-5">Nom d'article</th>
                <th className="p-4 md:p-5">Catégorie</th>
                <th className="p-4 md:p-5">Prix de vente</th>
                <th className="p-4 md:p-5">Niveau de Stock</th>
                <th className="p-4 md:p-5 text-right">Édition Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 md:p-5 font-mono font-bold text-slate-400">{prod.id}</td>
                  <td className="p-4 md:p-5">
                    <img 
                      src={prod.image} 
                      alt={prod.name} 
                      className="w-10 h-10 rounded-lg object-cover border bg-slate-50"
                      referrerPolicy="no-referrer"
                    />
                  </td>
                  <td className="p-4 md:p-5 font-semibold text-slate-800">{prod.name}</td>
                  <td className="p-4 md:p-5">{prod.category}</td>
                  <td className="p-4 md:p-5 font-bold text-slate-950">{prod.price} €</td>
                  <td className="p-4 md:p-5 font-semibold">
                    {stockEditId === prod.id ? (
                      <div className="flex items-center gap-1">
                        <input 
                          type="number" 
                          min="0"
                          value={tempStockValue}
                          onChange={(e) => setTempStockValue(Number(e.target.value))}
                          className="w-16 p-1 bg-slate-50 border rounded text-center text-xs font-bold"
                        />
                        <button 
                          onClick={() => handleSaveStock(prod.id)}
                          className="p-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${
                        prod.stock === 0 ? "bg-red-50 text-red-700" :
                        prod.stock <= 10 ? "bg-amber-50 text-amber-700" :
                        "bg-emerald-50 text-emerald-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${prod.stock === 0 ? "bg-red-500" : prod.stock <= 10 ? "bg-amber-500" : "bg-emerald-500"}`} />
                        {prod.stock} unités
                      </span>
                    )}
                  </td>
                  <td className="p-4 md:p-5 text-right">
                    {stockEditId !== prod.id && (
                      <button 
                        onClick={() => handleStartStockEdit(prod)}
                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Modifier
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Modal Backdrop */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-3xl max-w-md w-full border border-slate-100 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-lg">Ajouter une référence</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewProductSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nom de l'article</label>
                <input 
                  type="text" 
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="ex: Casque Audio Aura V2"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Prix (€)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Quantité Stock</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Catégorie</label>
                <select 
                  value={newProdCat}
                  onChange={(e) => setNewProdCat(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-700"
                >
                  <option value="Électronique">Électronique</option>
                  <option value="Mode">Mode</option>
                  <option value="Maison & Déco">Maison & Déco</option>
                  <option value="Bien-être & Beauté">Bien-être & Beauté</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Description de l'article</label>
                <textarea 
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  rows={3}
                  placeholder="Décrivez brièvement les points forts du produit..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Enregistrer l'article
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

// 7. GESTION DES RETOURS - VENDEUR
export const GestionRetoursScreen: React.FC<SellerScreenProps> = ({
  onNavigate,
  returns,
  onSelectReturn
}) => {
  const [search, setSearch] = useState("");

  const filtered = returns.filter(r => 
    r.id.toLowerCase().includes(search.toLowerCase()) || 
    r.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-gestion-retours"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Gestion des Retours</h1>
          <p className="text-sm text-slate-500">Supervisez et inspectez les demandes de retours d'articles défectueux</p>
        </div>
        <button 
          onClick={() => onNavigate(Screen.TableauDeBordVendeur)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher par ID retour ou nom client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 md:p-5">ID Retour</th>
                <th className="p-4 md:p-5">Commande Liée</th>
                <th className="p-4 md:p-5">Client</th>
                <th className="p-4 md:p-5">Article concerné</th>
                <th className="p-4 md:p-5">Motif</th>
                <th className="p-4 md:p-5">Statut</th>
                <th className="p-4 md:p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
              {filtered.map((ret) => (
                <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 md:p-5 font-mono font-bold text-slate-900">{ret.id}</td>
                  <td className="p-4 md:p-5 font-mono font-semibold text-slate-400">{ret.orderId}</td>
                  <td className="p-4 md:p-5">
                    <div className="font-semibold text-slate-800">{ret.customerName}</div>
                    <div className="text-[10px] text-slate-400">{ret.email}</div>
                  </td>
                  <td className="p-4 md:p-5 font-semibold text-slate-700">{ret.product.name} (x{ret.quantity})</td>
                  <td className="p-4 md:p-5">{ret.reason}</td>
                  <td className="p-4 md:p-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      ret.status === "Approuvé" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                      ret.status === "Rejeté" ? "bg-red-50 text-red-700 border border-red-100" :
                      "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {ret.status}
                    </span>
                  </td>
                  <td className="p-4 md:p-5 text-right">
                    <button 
                      onClick={() => { onSelectReturn(ret); onNavigate(Screen.DetailsRetour); }}
                      className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition-colors inline-flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <Eye className="w-4 h-4" />
                      Inspecter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// 5. DÉTAILS DU RETOUR - VENDEUR
export const DetailsRetourScreen: React.FC<SellerScreenProps> = ({
  onNavigate,
  selectedReturn,
  onUpdateReturnStatus
}) => {
  const [comment, setComment] = useState("");

  if (!selectedReturn) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl">
        <ArrowLeft className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Aucun retour sélectionné</h3>
        <button onClick={() => onNavigate(Screen.GestionRetours)} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl">
          Liste des retours
        </button>
      </div>
    );
  }

  const handleAction = (status: "Approuvé" | "Rejeté") => {
    onUpdateReturnStatus(selectedReturn.id, status, comment || "Demande traitée par le service vendeur AuraMarket.");
    onNavigate(Screen.GestionRetours);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-16"
      id="screen-details-retour"
    >
      <button 
        onClick={() => onNavigate(Screen.GestionRetours)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retourner aux demandes de retours
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Detail view info */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-50 pb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID DEMANDE</span>
              <h2 className="font-mono text-lg font-bold text-slate-800">{selectedReturn.id}</h2>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COMMANDE ASSOCIEE</span>
              <p className="font-mono font-bold text-slate-700 text-xs">{selectedReturn.orderId}</p>
            </div>
          </div>

          {/* Product return details */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-xs uppercase text-slate-400 tracking-wider">Article concerné</h3>
            <div className="flex gap-4 items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <img 
                src={selectedReturn.product.image} 
                alt={selectedReturn.product.name} 
                className="w-14 h-14 rounded-xl object-cover border bg-white"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{selectedReturn.product.name}</h4>
                <p className="text-xs text-slate-400">Quantité renvoyée : {selectedReturn.quantity}</p>
                <p className="text-xs font-bold text-slate-900 pt-0.5">Montant remboursement : {selectedReturn.refundAmount} €</p>
              </div>
            </div>
          </div>

          {/* Reason details */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motif invoqué par le client</span>
            <div className="p-4 bg-red-50/10 border border-red-100/30 rounded-2xl text-xs md:text-sm text-slate-700 space-y-2">
              <p className="font-bold text-slate-900 text-xs md:text-sm">Raison : {selectedReturn.reason}</p>
              <p className="font-light leading-relaxed">{selectedReturn.description}</p>
            </div>
          </div>

          {/* Customer attachments */}
          {selectedReturn.images && selectedReturn.images.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Photo(s) justificative(s)</span>
              <div className="flex gap-4">
                {selectedReturn.images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt="Justificatif" 
                    className="w-32 h-32 rounded-xl object-cover border"
                    referrerPolicy="no-referrer"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Process refund and accept/reject decision */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Traitement de la réclamation</h3>
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Commentaire vendeur</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Saisissez un message de réponse pour expliquer votre décision au client..."
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-xs resize-none"
            />
          </div>

          {selectedReturn.status === "En attente" ? (
            <div className="grid grid-cols-1 gap-2 pt-2">
              <button 
                onClick={() => handleAction("Approuvé")}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4.5 h-4.5" />
                Approuver & Rembourser ({selectedReturn.refundAmount} €)
              </button>
              <button 
                onClick={() => handleAction("Rejeté")}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <X className="w-4.5 h-4.5" />
                Rejeter la demande
              </button>
            </div>
          ) : (
            <div className={`p-4 rounded-xl text-xs font-semibold text-center border ${
              selectedReturn.status === "Approuvé" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700"
            }`}>
              Cette réclamation a déjà été traitée : {selectedReturn.status}
              {selectedReturn.sellerComment && (
                <p className="font-normal text-slate-500 pt-2 text-left text-[11px] border-t border-dashed border-slate-200/50 mt-2">
                  Commentaire : {selectedReturn.sellerComment}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// 19. AIDE ET FAQ - VENDEUR
export const AideFAQScreen: React.FC<SellerScreenProps> = ({
  onNavigate,
  faqs,
  onAddFAQ
}) => {
  const [activeCat, setActiveCat] = useState<any>("Tous");
  const [search, setSearch] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCat, setNewCat] = useState<any>("Commandes");

  const categories = ["Tous", "Commandes", "Livraison", "Retours", "Paiements", "Général"];

  const filtered = faqs.filter(faq => {
    const matchesCat = activeCat === "Tous" || faq.category === activeCat;
    const matchesSearch = faq.question.toLowerCase().includes(search.toLowerCase()) || 
                          faq.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleAddFAQSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;

    onAddFAQ({
      id: `faq-${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
      category: newCat
    });

    setShowAddForm(false);
    setNewQuestion("");
    setNewAnswer("");
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-faq"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Centre d'Aide & FAQ</h1>
          <p className="text-sm text-slate-500">Trouvez des réponses rapides aux questions fréquentes ou ajoutez de nouvelles notices d'assistance</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/10"
          >
            <Plus className="w-4 h-4" />
            Nouvelle FAQ
          </button>
          <button 
            onClick={() => onNavigate(Screen.TableauDeBordVendeur)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>

      {/* Grid of contents search and navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recherche</span>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Catégories</span>
            <div className="flex flex-col gap-1 text-xs">
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveCat(cat as any)}
                  className={`w-full py-2 px-3 text-left font-semibold rounded-lg transition-colors ${
                    activeCat === cat ? "bg-brand-50 text-brand-600" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs List Accordion */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
              <HelpCircle className="w-5 h-5 text-brand-600" />
              Questions fréquentes de la communauté ({filtered.length})
            </h3>

            <div className="space-y-4">
              {filtered.map((faq) => (
                <div key={faq.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-bold text-slate-800 text-sm">{faq.question}</h4>
                    <span className="px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] rounded font-bold">{faq.category}</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed font-light">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer support section */}
          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-base flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Vous rencontrez un incident technique majeur ?
              </h3>
              <p className="text-slate-400 text-xs max-w-xl font-light leading-relaxed">
                Notre service technique dédié aux marchands et administrateurs d'AuraMarket est disponible par chat instantané ou via ticket de réclamation d'urgence.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="mailto:diaexpressofficial@gmail.com" className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold transition-all inline-flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                E-mail d'assistance
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add New FAQ Modal Backdrop */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-3xl max-w-md w-full border border-slate-100 shadow-xl space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-display font-bold text-slate-900 text-lg">Ajouter une FAQ</h3>
              <button 
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFAQSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Question</label>
                <input 
                  type="text" 
                  required
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="ex: Comment retourner un colis de plus de 15kg ?"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Catégorie</label>
                <select 
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-slate-700"
                >
                  <option value="Commandes">Commandes</option>
                  <option value="Livraison">Livraison</option>
                  <option value="Retours">Retours</option>
                  <option value="Paiements">Paiements</option>
                  <option value="Général">Général</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Réponse d'aide</label>
                <textarea 
                  required
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={4}
                  placeholder="Décrivez précisément la solution ou procédure d'aide..."
                  className="w-full p-2.5 bg-slate-50 border rounded-xl resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-xs transition-colors"
                >
                  Ajouter à l'aide
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Annuler
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};
