import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ShoppingBag, Heart, Star, ChevronRight, Search, 
  MapPin, CreditCard, CheckCircle2, User, Settings, 
  Trash2, ArrowLeft, Plus, Minus, Package, Grid, 
  Laptop, Smartphone, Tv, Headphones, SlidersHorizontal, Info, Check
} from "lucide-react";
import { Screen, Product, CartItem, Order } from "../types";

interface ClientScreenProps {
  onNavigate: (screen: Screen) => void;
  products: Product[];
  cart: CartItem[];
  onAddToCart: (product: Product, qty: number, color?: string, size?: string) => void;
  onRemoveFromCart: (productId: string) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
  currentProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  checkoutInfo: any;
  onUpdateCheckoutInfo: (info: any) => void;
  orders: Order[];
  onPlaceOrder: () => void;
  latestOrder: Order | null;
  accountSettings: any;
  onUpdateAccountSettings: (settings: any) => void;
  onAddReview?: (productId: string, rating: number, comment: string, author: string) => void;
}

// 1. ACCUEIL CLIENT - AURAMARKET
export const AccueilClientScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  products,
  wishlist,
  onToggleWishlist,
  onSelectProduct,
  onAddToCart
}) => {
  const featuredProducts = products.slice(0, 4);
  const electronicsProducts = products.filter(p => p.isElectronic).slice(0, 4);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-10 pb-16"
      id="screen-accueil-client"
    >
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-brand-950 via-slate-900 to-brand-800 text-white p-8 md:p-16 flex flex-col md:flex-row items-center gap-8 shadow-xl border border-brand-800/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="flex-1 space-y-6 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-200 text-xs font-semibold tracking-wide uppercase">
            Collection Été 2026
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
            L'Élégance Connectée à <span className="text-brand-200 bg-clip-text text-transparent bg-gradient-to-r from-brand-200 to-violet-300">Portée de Main</span>
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-xl font-light">
            Découvrez une sélection exclusive d'appareils de haute technologie de pointe et de créations artisanales haut de gamme pour sublimer votre quotidien.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={() => onNavigate(Screen.Boutique)}
              className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-lg hover:shadow-brand-500/20 transition-all flex items-center gap-2 text-sm"
              id="hero-btn-shop"
            >
              Découvrir la Boutique
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onNavigate(Screen.BoutiqueElectronique)}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700 hover:border-slate-600 transition-all text-sm flex items-center gap-2"
              id="hero-btn-electronics"
            >
              <Smartphone className="w-4 h-4" />
              Boutique Électronique
            </button>
          </div>
        </div>
        <div className="flex-1 relative w-full h-48 md:h-80 flex items-center justify-center">
          <div className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-brand-500/25 blur-3xl" />
          <img 
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" 
            alt="Aura Hero" 
            className="w-full max-w-sm h-40 md:h-64 object-contain drop-shadow-2xl relative z-10 animate-pulse"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Category Shortcuts Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Parcourir les Catégories</h2>
            <p className="text-sm text-slate-500">Explorez nos univers soigneusement sélectionnés</p>
          </div>
          <button 
            onClick={() => onNavigate(Screen.ParcourirCategories)}
            className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1 transition-all"
          >
            Tout voir <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Électronique", icon: Laptop, count: "3 produits", color: "bg-blue-50 text-blue-600 border-blue-100", route: Screen.BoutiqueElectronique },
            { name: "Mode", icon: Heart, count: "2 produits", color: "bg-rose-50 text-rose-600 border-rose-100", route: Screen.Boutique },
            { name: "Maison & Déco", icon: Package, count: "2 produits", color: "bg-amber-50 text-amber-600 border-amber-100", route: Screen.Boutique },
            { name: "Bien-être & Beauté", icon: Star, count: "1 produit", color: "bg-emerald-50 text-emerald-600 border-emerald-100", route: Screen.Boutique }
          ].map((cat, i) => (
            <div 
              key={i}
              onClick={() => onNavigate(cat.route)}
              className={`p-5 rounded-2xl border ${cat.color} cursor-pointer hover:shadow-md transition-all space-y-4 group`}
            >
              <div className="p-3 w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <cat.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base">{cat.name}</h3>
                <p className="text-xs opacity-75">{cat.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Nos Best-Sellers</h2>
            <p className="text-sm text-slate-500">Les créations les plus prisées par notre communauté</p>
          </div>
          <button 
            onClick={() => onNavigate(Screen.Boutique)}
            className="text-brand-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1 transition-all"
          >
            Voir tous les produits <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => {
            const isWish = wishlist.some(item => item.id === product.id);
            return (
              <div 
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
                id={`product-card-${product.id}`}
              >
                <div className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer" onClick={() => { onSelectProduct(product); onNavigate(Screen.DetailsProduit); }}>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {product.originalPrice && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase">
                      Promo
                    </span>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow bg-white flex items-center justify-center transition-all ${isWish ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${isWish ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{product.category}</span>
                    <h3 
                      onClick={() => { onSelectProduct(product); onNavigate(Screen.DetailsProduit); }}
                      className="font-bold text-slate-800 text-sm line-clamp-1 hover:text-brand-600 cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold">{product.rating}</span>
                      <span className="text-slate-400">({product.reviewsCount})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-extrabold text-slate-950 text-base">{product.price} €</span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through ml-1.5">{product.originalPrice} €</span>
                      )}
                    </div>
                    <button 
                      onClick={() => onAddToCart(product, 1)}
                      className="p-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 transition-colors"
                      title="Ajouter au panier"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Electronics Section Shortcut */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
        <div className="space-y-2">
          <h3 className="font-display text-xl md:text-2xl font-bold text-white">Boutique Tech Exclusive</h3>
          <p className="text-slate-400 text-sm max-w-xl">
            Retrouvez notre gamme d'appareils électroniques brevetés Aura : smartphones, casques haut de gamme, montres intelligentes avec livraison express assurée.
          </p>
        </div>
        <button 
          onClick={() => onNavigate(Screen.BoutiqueElectronique)}
          className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-semibold transition-all whitespace-nowrap shadow-sm"
        >
          Accéder à l'Électronique
        </button>
      </div>
    </motion.div>
  );
};

// 4. BOUTIQUE - LISTE DES PRODUITS
export const BoutiqueScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  products,
  wishlist,
  onToggleWishlist,
  onSelectProduct,
  onAddToCart
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [priceRange, setPriceRange] = useState(1000);
  const [sortBy, setSortBy] = useState("popularity");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);

  const categories = ["Tous", ...Array.from(new Set(products.map(p => p.category)))];

  const getProductBrand = (p: Product) => {
    return p.specs?.["Marque"] || "Soie de Lyon";
  };

  const availableBrands = Array.from(new Set(products.map(p => getProductBrand(p))));

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Tous" || product.category === selectedCategory;
    const matchesPrice = product.price <= priceRange;
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(getProductBrand(product));
    const matchesRating = product.rating >= minRating;
    return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesRating;
  }).sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "popularity") return b.reviewsCount - a.reviewsCount;
    if (sortBy === "news") {
      const idA = parseInt(a.id.replace(/\D/g, "")) || 0;
      const idB = parseInt(b.id.replace(/\D/g, "")) || 0;
      if (idA && idB) return idB - idA;
      return b.id.localeCompare(a.id);
    }
    return b.rating - a.rating;
  });

  const activeFiltersCount = 
    (selectedCategory !== "Tous" ? 1 : 0) + 
    (priceRange < 1000 ? 1 : 0) + 
    (selectedBrands.length > 0 ? 1 : 0) + 
    (minRating > 0 ? 1 : 0);

  const renderFilterStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 ml-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const starVal = i + 1;
          const isFilled = rating >= starVal;
          return (
            <Star 
              key={i} 
              className={`w-3 h-3 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
            />
          );
        })}
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-boutique-liste"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Boutique AuraMarket</h1>
        <p className="text-sm text-slate-500">Parcourez notre collection complète d'articles haut de gamme</p>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
        {/* Search and Sort row */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Rechercher un produit, une marque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-sm transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
          <div className="w-full md:w-48">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-3 px-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm text-slate-700 font-semibold"
            >
              <option value="popularity">Popularité</option>
              <option value="news">Nouveautés</option>
              <option value="price-asc">Prix : croissant</option>
              <option value="price-desc">Prix : décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>
        </div>

        {/* Filters Header with Badge & Clear buttons */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Filtres de recherche</span>
            {activeFiltersCount > 0 && (
              <span className="bg-brand-100 text-brand-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button 
              onClick={() => { 
                setSelectedCategory("Tous"); 
                setPriceRange(1000); 
                setSelectedBrands([]); 
                setMinRating(0); 
              }}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              Réinitialiser tout
            </button>
          )}
        </div>

        {/* 4-column filter panels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Column 1: Categories */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Catégorie</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                    selectedCategory === cat 
                      ? 'bg-brand-50 text-brand-700 font-semibold border-l-2 border-brand-600 pl-4' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Brands */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marques</label>
              {selectedBrands.length > 0 && (
                <button 
                  onClick={() => setSelectedBrands([])}
                  className="text-[10px] text-brand-600 hover:underline font-bold"
                >
                  Effacer
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {availableBrands.map(brand => {
                const isChecked = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    onClick={() => {
                      setSelectedBrands(prev => 
                        prev.includes(brand) 
                          ? prev.filter(b => b !== brand) 
                          : [...prev, brand]
                      );
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      isChecked 
                        ? 'bg-brand-50 text-brand-700 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span>{brand}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Column 3: Price range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Budget Max</label>
              <span className="text-xs font-extrabold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">{priceRange} €</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <input 
                type="range" 
                min="30" 
                max="1000" 
                step="10"
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-brand-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5">
                <span>30 €</span>
                <span>500 €</span>
                <span>1000 €</span>
              </div>
            </div>
          </div>

          {/* Column 4: User ratings */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Évaluation client</label>
            <div className="space-y-1">
              {[
                { val: 0, label: "Tous les avis" },
                { val: 4.5, label: "4.5 et plus" },
                { val: 4.0, label: "4.0 et plus" },
                { val: 3.5, label: "3.5 et plus" }
              ].map(opt => {
                const isSelected = minRating === opt.val;
                return (
                  <button
                    key={opt.val}
                    onClick={() => setMinRating(opt.val)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-brand-50 text-brand-700 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'border-brand-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
                      </div>
                      <span>{opt.label}</span>
                    </div>
                    {opt.val > 0 && renderFilterStars(opt.val)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isWish = wishlist.some(item => item.id === product.id);
            return (
              <div 
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
              >
                <div 
                  className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer"
                  onClick={() => { onSelectProduct(product); onNavigate(Screen.DetailsProduit); }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {product.originalPrice && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-1 rounded-md uppercase">
                      Promo
                    </span>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow bg-white flex items-center justify-center transition-all ${isWish ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${isWish ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{product.category}</span>
                    <h3 
                      onClick={() => { onSelectProduct(product); onNavigate(Screen.DetailsProduit); }}
                      className="font-bold text-slate-800 text-sm line-clamp-1 hover:text-brand-600 cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold">{product.rating}</span>
                      <span className="text-slate-400">({product.reviewsCount})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="font-extrabold text-slate-950 text-base">{product.price} €</span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through ml-1.5">{product.originalPrice} €</span>
                      )}
                    </div>
                    <button 
                      onClick={() => onAddToCart(product, 1)}
                      className="p-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-600 transition-colors"
                      title="Ajouter au panier"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Aucun produit trouvé</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">Essayez d'ajuster votre recherche, d'augmenter le prix maximum, ou de changer de catégorie.</p>
          <button 
            onClick={() => { 
              setSearchQuery(""); 
              setSelectedCategory("Tous"); 
              setPriceRange(1000); 
              setSelectedBrands([]); 
              setMinRating(0); 
            }}
            className="mt-6 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium transition-colors text-xs"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </motion.div>
  );
};

// 8. BOUTIQUE ÉLECTRONIQUE - AURAMARKET
export const BoutiqueElectroniqueScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  products,
  wishlist,
  onToggleWishlist,
  onSelectProduct,
  onAddToCart
}) => {
  const electronics = products.filter(p => p.isElectronic || p.category === "Électronique");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-boutique-electronique"
    >
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 md:p-12 border border-blue-500/10 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/40 to-brand-950/40 z-0" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl z-0" />
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            Espace High-Tech
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold">Univers Aura Électronique</h1>
          <p className="text-slate-400 text-sm font-light">
            Découvrez nos équipements électroniques d'exception. De la connectivité 5G à l'immersion audio spatialisée, explorez le futur de l'ingénierie Aura.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-slate-800">Équipements Haute Technologie ({electronics.length})</h2>
          <button 
            onClick={() => onNavigate(Screen.Boutique)}
            className="text-slate-500 hover:text-slate-800 text-xs font-medium flex items-center gap-1"
          >
            Retour boutique générale <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {electronics.map(product => {
            const isWish = wishlist.some(item => item.id === product.id);
            return (
              <div 
                key={product.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
              >
                <div 
                  className="relative aspect-square bg-slate-50 overflow-hidden cursor-pointer"
                  onClick={() => { onSelectProduct(product); onNavigate(Screen.DetailsProduit); }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow bg-white flex items-center justify-center transition-all ${isWish ? 'text-red-500' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${isWish ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 
                        onClick={() => { onSelectProduct(product); onNavigate(Screen.DetailsProduit); }}
                        className="font-bold text-slate-800 text-base line-clamp-1 hover:text-brand-600 cursor-pointer transition-colors"
                      >
                        {product.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-semibold">{product.rating}</span>
                      <span className="text-slate-400">({product.reviewsCount} avis)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <span className="font-extrabold text-slate-950 text-lg">{product.price} €</span>
                    <button 
                      onClick={() => onAddToCart(product, 1)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// 6. PARCOURIR LES CATÉGORIES - AURAMARKET
export const ParcourirCategoriesScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  products
}) => {
  const categoriesList = [
    { name: "Électronique", desc: "Téléphones 5G, casques de son spatial et bracelets fitness.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", count: 3, route: Screen.BoutiqueElectronique },
    { name: "Mode", desc: "Accessoires, vêtements haut de gamme et soierie artisanale.", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80", count: 2, route: Screen.Boutique },
    { name: "Maison & Déco", desc: "Cafetières haut de gamme, coussins d'ornement et mobilier chic.", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80", count: 2, route: Screen.Boutique },
    { name: "Bien-être & Beauté", desc: "Senteurs d'exception, huiles et bougies bio coulées main.", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80", count: 1, route: Screen.Boutique }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-categories"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Parcourir les Catégories</h1>
        <p className="text-sm text-slate-500">Explorez nos univers de créations uniques et d'appareils haut de gamme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categoriesList.map((cat, idx) => (
          <div 
            key={idx}
            onClick={() => onNavigate(cat.route)}
            className="group relative rounded-3xl overflow-hidden h-64 cursor-pointer shadow-sm hover:shadow-md border border-slate-100 transition-all flex flex-col justify-end p-6 bg-slate-900 text-white"
          >
            <img 
              src={cat.image} 
              alt={cat.name} 
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-transparent" />
            <div className="relative z-10 space-y-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-brand-500 text-white uppercase tracking-wider">
                {cat.count} {cat.count > 1 ? "Articles" : "Article"}
              </span>
              <h3 className="font-display text-2xl font-extrabold tracking-tight">{cat.name}</h3>
              <p className="text-slate-300 text-xs md:text-sm max-w-sm line-clamp-2 font-light">{cat.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// 13. DÉTAILS DU PRODUIT - AURAMARKET
export const DetailsProduitScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  currentProduct,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onAddReview
}) => {
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "features">("desc");
  const [selectedColor, setSelectedColor] = useState("Charbon");

  // Review form states
  const [reviewAuthor, setReviewAuthor] = useState("Camille Dubois");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [showFormSuccess, setShowFormSuccess] = useState(false);

  if (!currentProduct) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl">
        <ArrowLeft className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold">Aucun produit sélectionné</h3>
        <button onClick={() => onNavigate(Screen.Boutique)} className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl">
          Aller à la Boutique
        </button>
      </div>
    );
  }

  const isWish = wishlist.some(item => item.id === currentProduct.id);
  const productReviews = currentProduct.reviews || [];

  // Calculate rating distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  productReviews.forEach(r => {
    const rStar = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
    if (distribution[rStar] !== undefined) {
      distribution[rStar]++;
    }
  });

  const totalReviewsCount = productReviews.length;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-16"
      id="screen-details-produit"
    >
      <button 
        onClick={() => onNavigate(Screen.Boutique)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retourner à la boutique
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-sm">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
            <img 
              src={currentProduct.image} 
              alt={currentProduct.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {currentProduct.originalPrice && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-md uppercase">
                Réduction
              </span>
            )}
            <button 
              onClick={() => onToggleWishlist(currentProduct)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full shadow bg-white flex items-center justify-center transition-all ${isWish ? 'text-red-500' : 'text-slate-400'}`}
            >
              <Heart className={`w-5 h-5 ${isWish ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Details info */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest">{currentProduct.category}</span>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{currentProduct.name}</h1>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{currentProduct.rating}</span>
                <span className="text-slate-400">({currentProduct.reviewsCount} avis client)</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className={`inline-flex items-center gap-1 font-semibold text-xs ${currentProduct.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {currentProduct.stock > 0 ? `En stock (${currentProduct.stock} restants)` : "Rupture de stock"}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-3xl font-black text-slate-950">{currentProduct.price} €</span>
              {currentProduct.originalPrice && (
                <span className="text-lg text-slate-400 line-through">{currentProduct.originalPrice} €</span>
              )}
            </div>

            <p className="text-slate-600 text-sm font-light leading-relaxed">{currentProduct.description}</p>

            {/* Colors Selection if applicable */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Couleur : {selectedColor}</span>
              <div className="flex gap-2">
                {["Charbon", "Titane", "Nacre"].map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${selectedColor === color ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center border border-slate-200 rounded-xl w-fit">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="p-3 hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-slate-800 text-sm">{qty}</span>
                <button 
                  onClick={() => setQty(Math.min(currentProduct.stock, qty + 1))}
                  className="p-3 hover:bg-slate-50 text-slate-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => { onAddToCart(currentProduct, qty, selectedColor); onNavigate(Screen.VotrePanier); }}
                disabled={currentProduct.stock <= 0}
                className="flex-1 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold shadow-lg hover:shadow-brand-500/10 transition-all text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Ajouter au panier ({currentProduct.price * qty} €)
              </button>
            </div>
          </div>

          {/* Product Tabs details */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex border-b border-slate-100 mb-4">
              {[
                { id: "desc", name: "Détails" },
                { id: "features", name: "Points Clés" },
                { id: "specs", name: "Fiche Technique" }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[2px] transition-all ${activeTab === tab.id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            <div className="text-xs md:text-sm text-slate-600 space-y-2">
              {activeTab === "desc" && (
                <p className="leading-relaxed font-light">{currentProduct.description}</p>
              )}
              {activeTab === "features" && (
                <ul className="space-y-1.5 list-disc pl-4 font-light">
                  {currentProduct.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              )}
              {activeTab === "specs" && (
                <div className="grid grid-cols-2 gap-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  {Object.entries(currentProduct.specs).map(([k, v]) => (
                    <React.Fragment key={k}>
                      <span className="font-semibold text-slate-500">{k}</span>
                      <span className="text-slate-800 text-right">{v}</span>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION DES AVIS ET COMMENTAIRES */}
      <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8" id="product-reviews-section">
        <div className="border-b border-slate-100 pb-5">
          <h2 className="font-display text-xl md:text-2xl font-extrabold text-slate-900">Avis et commentaires des clients</h2>
          <p className="text-xs md:text-sm text-slate-500 font-light mt-1">
            Découvrez les retours de notre communauté sur cet article d'exception
          </p>
        </div>

        {/* Global Statistics & Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Statistics */}
          <div className="space-y-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50 flex flex-col justify-center">
            <div className="text-center space-y-1">
              <span className="text-5xl font-black text-slate-900">{currentProduct.rating}</span>
              <span className="text-slate-400 font-medium text-lg"> / 5</span>
              <div className="flex justify-center gap-1 text-amber-500 py-1">
                {Array.from({ length: 5 }).map((_, i) => {
                  const starVal = i + 1;
                  const isFilled = currentProduct.rating >= starVal;
                  const isHalf = !isFilled && currentProduct.rating >= starVal - 0.7;
                  return (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${isFilled ? 'fill-current text-amber-400' : isHalf ? 'fill-amber-400/50 text-amber-400' : 'text-slate-200'}`} 
                    />
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Basé sur {currentProduct.reviewsCount} {currentProduct.reviewsCount > 1 ? "avis" : "avis"}
              </p>
            </div>

            {/* Distribution bars */}
            <div className="space-y-2 pt-2">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = (distribution as any)[stars] || 0;
                const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-600 w-3">{stars}</span>
                    <Star className="w-3 h-3 text-amber-400 fill-current shrink-0" />
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-slate-400 font-semibold w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2 & 3: Review Form */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                Laisser un avis sur ce produit
              </h3>

              {showFormSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-600" />
                  <span>Merci ! Votre avis a été enregistré avec succès et pris en compte.</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Votre Nom</label>
                    <input 
                      type="text" 
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="Ex: Camille Dubois"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-xs md:text-sm text-slate-800 transition-all placeholder-slate-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Votre Note</label>
                    <div className="flex items-center gap-1 py-2">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1;
                        const isFilled = (hoverRating || reviewRating) >= starVal;
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setReviewRating(starVal)}
                            onMouseEnter={() => setHoverRating(starVal)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-amber-400 focus:outline-none transition-transform active:scale-125"
                          >
                            <Star 
                              className={`w-6 h-6 transition-colors ${isFilled ? 'fill-current text-amber-400' : 'text-slate-200'}`} 
                            />
                          </button>
                        );
                      })}
                      <span className="text-xs text-slate-500 font-bold ml-2">
                        {reviewRating === 5 ? "Excellent !" : reviewRating === 4 ? "Très bon" : reviewRating === 3 ? "Moyen" : reviewRating === 2 ? "Décevant" : "Médiocre"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Votre Commentaire</label>
                  <textarea 
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Qu'avez-vous pensé de la qualité, du design ou des performances de ce produit ?"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-xs md:text-sm text-slate-800 transition-all placeholder-slate-400 resize-none font-light"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!reviewComment.trim()) return;
                      if (onAddReview) {
                        onAddReview(currentProduct.id, reviewRating, reviewComment, reviewAuthor);
                        setReviewComment("");
                        setShowFormSuccess(true);
                        setTimeout(() => setShowFormSuccess(false), 4000);
                      }
                    }}
                    disabled={!reviewComment.trim()}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-100 disabled:text-slate-400 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-brand-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Publier mon avis
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Tous les commentaires ({productReviews.length})
          </h3>

          {productReviews.length > 0 ? (
            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
              {productReviews.map((review, idx) => (
                <div 
                  key={review.id || idx}
                  className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100/70 space-y-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold uppercase">
                        {review.author.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs md:text-sm">{review.author}</h4>
                        <div className="flex items-center gap-1 text-amber-400 py-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current text-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-400 font-medium">
                      Publié le {new Date(review.date).toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-light pl-10">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200 p-6">
              <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-slate-700 text-sm font-bold">Aucun avis pour l'instant</h4>
              <p className="text-slate-400 text-xs max-w-xs mx-auto mt-1">Soyez le premier à partager votre expérience avec ce produit !</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// 9. VOTRE PANIER - AURAMARKET
export const VotrePanierScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  cart,
  onRemoveFromCart,
  onUpdateCartQty
}) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryCost = subtotal > 150 ? 0 : 9.9;
  const total = subtotal + deliveryCost;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-panier"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Votre Panier</h1>
        <p className="text-sm text-slate-500">Vérifiez vos articles avant de passer au paiement</p>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart list */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <img 
                  src={item.product.image} 
                  alt={item.product.name} 
                  className="w-20 h-20 rounded-xl object-cover border border-slate-100 bg-slate-50"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1">{item.product.name}</h3>
                    <button 
                      onClick={() => onRemoveFromCart(item.product.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">Couleur: {item.selectedColor || "Charbon"}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-extrabold text-slate-900 text-sm md:text-base">{item.product.price} €</span>
                    <div className="flex items-center border border-slate-100 rounded-lg">
                      <button 
                        onClick={() => onUpdateCartQty(item.product.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 hover:bg-slate-50 text-slate-500 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-800 text-xs">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateCartQty(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                        className="p-1.5 hover:bg-slate-50 text-slate-500 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-display font-bold text-slate-900 text-lg border-b border-slate-50 pb-3">Récapitulatif</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Sous-total</span>
                <span className="font-semibold text-slate-800">{subtotal} €</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Livraison</span>
                <span className="font-semibold text-slate-800">{deliveryCost === 0 ? "Gratuite" : `${deliveryCost} €`}</span>
              </div>
              {subtotal < 150 && (
                <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl text-xs text-brand-700 flex gap-1.5">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>Plus que <span className="font-bold">{150 - subtotal} €</span> pour bénéficier de la livraison gratuite Aura Express !</span>
                </div>
              )}
              <div className="border-t border-slate-100 pt-4 flex justify-between font-extrabold text-slate-950 text-base">
                <span>Total</span>
                <span>{total} €</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate(Screen.PaiementLivraison)}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all text-sm shadow-md flex items-center justify-center gap-1.5"
            >
              Passer la Commande
              <ChevronRight className="w-4.5 h-4.5" />
            </button>

            <button 
              onClick={() => onNavigate(Screen.Boutique)}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors pt-2 block"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Votre panier est vide</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
            Découvrez nos produits d'exception et laissez-vous tenter par le meilleur de la technologie Aura.
          </p>
          <button 
            onClick={() => onNavigate(Screen.Boutique)}
            className="mt-6 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all text-xs shadow-sm"
          >
            Faire mes achats
          </button>
        </div>
      )}
    </motion.div>
  );
};

// 14. MA LISTE D'ENVIES - AURAMARKET
export const MaListeEnviesScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  wishlist,
  onToggleWishlist,
  onAddToCart
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-wishlist"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Ma Liste d'Envies</h1>
        <p className="text-sm text-slate-500">Vos coups de cœur sauvegardés pour plus tard</p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <div 
              key={product.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col group relative"
            >
              <div className="relative aspect-square bg-slate-50 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => onToggleWishlist(product)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full shadow bg-white flex items-center justify-center text-red-500 hover:scale-110 transition-transform"
                >
                  <Heart className="w-4.5 h-4.5 fill-current" />
                </button>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{product.category}</span>
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-semibold">{product.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-extrabold text-slate-950 text-base">{product.price} €</span>
                  <button 
                    onClick={() => { onAddToCart(product, 1); onToggleWishlist(product); }}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8">
          <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Votre liste d'envies est vide</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-1">
            Cliquez sur l'icône de cœur sur les produits pour les enregistrer ici.
          </p>
          <button 
            onClick={() => onNavigate(Screen.Boutique)}
            className="mt-6 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors text-xs"
          >
            Parcourir les produits
          </button>
        </div>
      )}
    </motion.div>
  );
};

// 15. PAIEMENT ET LIVRAISON - AURAMARKET
export const PaiementLivraisonScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  checkoutInfo,
  onUpdateCheckoutInfo,
  cart
}) => {
  const [formData, setFormData] = useState({
    fullName: checkoutInfo.fullName || "Camille Dubois",
    email: checkoutInfo.email || "camille.dubois@gmail.com",
    phone: checkoutInfo.phone || "06 12 34 56 78",
    street: checkoutInfo.street || "18 Rue de la Paix",
    city: checkoutInfo.city || "Paris",
    postalCode: checkoutInfo.postalCode || "75002",
    country: checkoutInfo.country || "France",
    shippingMethod: checkoutInfo.shippingMethod || "Aura Express (Gratuit)",
    paymentMethod: checkoutInfo.paymentMethod || "Carte Bancaire"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCheckoutInfo(formData);
    onNavigate(Screen.RecapitulatifCommande);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-paiement-livraison"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Paiement & Livraison</h1>
        <p className="text-sm text-slate-500">Renseignez vos informations de livraison et de paiement</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Section Adresse */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-50 pb-3">
              <MapPin className="w-5 h-5 text-brand-600" />
              Adresse de Livraison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Nom Complet</label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Téléphone</label>
                <input 
                  type="text" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Adresse</label>
                <input 
                  type="text" 
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Code Postal</label>
                <input 
                  type="text" 
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Ville</label>
                <input 
                  type="text" 
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section Expédition */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-50 pb-3">
              <Package className="w-5 h-5 text-brand-600" />
              Mode de Livraison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Aura Express (Gratuit)", desc: "Livraison en 24-48h chez vous" },
                { name: "Colissimo Standard (9.90 €)", desc: "Livraison en 3-5 jours ouvrés" }
              ].map((m, idx) => (
                <label 
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${formData.shippingMethod === m.name ? 'border-brand-600 bg-brand-50/20' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="shipping"
                      checked={formData.shippingMethod === m.name}
                      onChange={() => setFormData({ ...formData, shippingMethod: m.name })}
                      className="accent-brand-600"
                    />
                    <span className="font-bold text-slate-800 text-sm">{m.name}</span>
                  </div>
                  <span className="text-xs text-slate-400 pl-5">{m.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section Paiement */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-2 border-b border-slate-50 pb-3">
              <CreditCard className="w-5 h-5 text-brand-600" />
              Méthode de Paiement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["Carte Bancaire", "PayPal", "Apple Pay"].map((method, idx) => (
                <label 
                  key={idx}
                  className={`p-4 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${formData.paymentMethod === method ? 'border-brand-600 bg-brand-50/20' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <input 
                    type="radio" 
                    name="payment"
                    checked={formData.paymentMethod === method}
                    onChange={() => setFormData({ ...formData, paymentMethod: method })}
                    className="accent-brand-600"
                  />
                  <span className="font-bold text-slate-800 text-xs md:text-sm">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Panel validation */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-slate-900 text-base border-b border-slate-50 pb-2">Résumé de la commande</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="text-slate-600 truncate max-w-[140px]">{item.product.name} <span className="font-bold">x{item.quantity}</span></span>
                <span className="font-semibold text-slate-800">{item.product.price * item.quantity} €</span>
              </div>
            ))}
          </div>
          <button 
            type="submit"
            className="w-full py-3.5 mt-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all text-sm shadow-md"
          >
            Étape Suivante
          </button>
        </div>
      </form>
    </motion.div>
  );
};

// 10. RÉCAPITULATIF DE COMMANDE - AURAMARKET
export const RecapitulatifCommandeScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  cart,
  checkoutInfo,
  onPlaceOrder
}) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const deliveryCost = checkoutInfo.shippingMethod?.includes("Standard") ? 9.9 : 0;
  const tax = Math.round(subtotal * 0.2);
  const total = subtotal + deliveryCost;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-recapitulatif"
    >
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Récapitulatif de Commande</h1>
        <p className="text-sm text-slate-500">Veuillez vérifier les détails finaux avant de valider votre achat</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Verification lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-50 pb-2">Articles commandés</h3>
            <div className="divide-y divide-slate-50">
              {cart.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-sm">
                  <div className="flex gap-3 items-center">
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="w-12 h-12 rounded-lg object-cover border"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm">{item.product.name}</h4>
                      <p className="text-xs text-slate-400">Qté: {item.quantity} | Couleur: {item.selectedColor || "Charbon"}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{item.product.price * item.quantity} €</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase text-slate-400 tracking-wider">Adresse de Livraison</h4>
              <p className="font-bold text-slate-800 text-sm">{checkoutInfo.fullName}</p>
              <p className="text-slate-600 text-sm font-light">{checkoutInfo.street}</p>
              <p className="text-slate-600 text-sm font-light">{checkoutInfo.postalCode} {checkoutInfo.city}, {checkoutInfo.country}</p>
              <p className="text-slate-400 text-xs pt-1">Tel : {checkoutInfo.phone}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase text-slate-400 tracking-wider">Mode d'expédition</h4>
                <p className="text-slate-700 text-sm font-semibold">{checkoutInfo.shippingMethod}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase text-slate-400 tracking-wider">Moyen de paiement</h4>
                <p className="text-slate-700 text-sm font-semibold">{checkoutInfo.paymentMethod}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Final Payment computation panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h3 className="font-display font-bold text-slate-900 text-lg border-b border-slate-50 pb-3">Détail Facturation</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Articles</span>
              <span className="font-semibold text-slate-800">{subtotal} €</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Frais de port</span>
              <span className="font-semibold text-slate-800">{deliveryCost === 0 ? "Gratuit" : `${deliveryCost} €`}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>TVA (20% incluse)</span>
              <span className="font-semibold text-slate-400">{tax} €</span>
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between font-extrabold text-slate-950 text-lg">
              <span>Total à payer</span>
              <span>{total} €</span>
            </div>
          </div>

          <button 
            onClick={onPlaceOrder}
            className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all text-sm shadow-md flex items-center justify-center gap-2"
            id="place-order-btn"
          >
            <CheckCircle2 className="w-5 h-5" />
            Confirmer & Régler {total} €
          </button>
          
          <button 
            onClick={() => onNavigate(Screen.PaiementLivraison)}
            className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors pt-1 block"
          >
            Modifier mes informations
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// 2. CONFIRMATION DE COMMANDE - AURAMARKET
export const ConfirmationCommandeScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  latestOrder
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto py-12 text-center space-y-8"
      id="screen-confirmation"
    >
      <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center justify-center mx-auto shadow-md">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          Commande Validée avec succès
        </span>
        <h1 className="font-display text-3xl font-extrabold text-slate-950">Merci pour votre commande !</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
          Un e-mail de confirmation contenant votre facture détaillée et vos informations de suivi vient de vous être envoyé.
        </p>
      </div>

      {latestOrder && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-left divide-y divide-slate-50 text-sm max-w-sm mx-auto">
          <div className="pb-3 flex justify-between text-xs text-slate-500 font-semibold">
            <span>Numéro de commande :</span>
            <span className="text-slate-900 font-bold">{latestOrder.id}</span>
          </div>
          <div className="py-3 flex justify-between">
            <span>Client :</span>
            <span className="font-medium text-slate-800">{latestOrder.customerName}</span>
          </div>
          <div className="py-3 flex justify-between">
            <span>Mode d'expédition :</span>
            <span className="font-medium text-slate-800 text-xs">{latestOrder.shippingMethod}</span>
          </div>
          <div className="pt-3 flex justify-between font-bold text-slate-950">
            <span>Montant réglé :</span>
            <span>{latestOrder.total} €</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xs mx-auto pt-4">
        <button 
          onClick={() => onNavigate(Screen.AccueilClient)}
          className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all text-xs shadow-sm"
        >
          Retour à l'Accueil
        </button>
        <button 
          onClick={() => onNavigate(Screen.MonProfil)}
          className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all text-xs"
        >
          Suivre ma commande
        </button>
      </div>
    </motion.div>
  );
};

// 11. MON PROFIL - AURAMARKET
export const MonProfilScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  orders,
  wishlist,
  accountSettings
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-profil"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-2xl shadow-inner">
            {accountSettings.fullName?.charAt(0) || "C"}
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold text-slate-950">{accountSettings.fullName || "Camille Dubois"}</h1>
            <p className="text-slate-500 text-xs font-light">{accountSettings.email || "camille.dubois@gmail.com"}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate(Screen.ParametresCompte)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold transition-all text-xs flex items-center gap-1.5 bg-white"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            Paramètres
          </button>
          <button 
            onClick={() => onNavigate(Screen.MaListeEnvies)}
            className="px-4 py-2.5 rounded-xl border border-rose-100 hover:border-rose-200 text-rose-600 bg-rose-50/30 font-semibold transition-all text-xs flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4" />
            Coups de cœur ({wishlist.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Purchase History */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-brand-600" />
            Historique d'Achats ({orders.length})
          </h2>

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order, idx) => (
                <div 
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-slate-50 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID COMMANDE</span>
                      <span className="font-mono text-xs font-bold text-slate-800">{order.id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">DATE</span>
                      <span className="text-slate-800 text-xs font-medium">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">STATUT</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === "Livré" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        order.status === "Expédié" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                        order.status === "Préparé" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                        "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="text-slate-600 truncate max-w-sm">{it.product.name} <span className="font-semibold text-slate-400">x{it.quantity}</span></span>
                        <span className="font-bold text-slate-900">{it.price * it.quantity} €</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50 text-sm font-bold text-slate-950">
                    <span className="text-slate-500 font-normal">Total :</span>
                    <span>{order.total} €</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-sm">
              Vous n'avez pas encore passé de commande.
            </div>
          )}
        </div>

        {/* Account Details & Quick stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-50 pb-2">Informations de livraison par défaut</h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Destinataire :</span>
                <span className="font-semibold text-slate-800">{accountSettings.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Adresse :</span>
                <span className="font-semibold text-slate-800 text-right">{accountSettings.street || "18 Rue de la Paix"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Code postal / Ville :</span>
                <span className="font-semibold text-slate-800 text-right">{accountSettings.postalCode} {accountSettings.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Téléphone :</span>
                <span className="font-semibold text-slate-800">{accountSettings.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// 18. PARAMÈTRES DU COMPTE - AURAMARKET
export const ParametresCompteScreen: React.FC<ClientScreenProps> = ({
  onNavigate,
  accountSettings,
  onUpdateAccountSettings
}) => {
  const [formData, setFormData] = useState({
    fullName: accountSettings.fullName || "Camille Dubois",
    email: accountSettings.email || "camille.dubois@gmail.com",
    phone: accountSettings.phone || "06 12 34 56 78",
    street: accountSettings.street || "18 Rue de la Paix",
    city: accountSettings.city || "Paris",
    postalCode: accountSettings.postalCode || "75002",
    country: accountSettings.country || "France",
    password: "•••••••••••••"
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAccountSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-16"
      id="screen-parametres"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">Paramètres du Compte</h1>
          <p className="text-sm text-slate-500">Gérez vos coordonnées, adresse de facturation et mot de passe</p>
        </div>
        <button 
          onClick={() => onNavigate(Screen.MonProfil)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          Retour au profil
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm max-w-3xl space-y-6">
        <h3 className="font-bold text-slate-800 text-lg border-b border-slate-50 pb-3 flex items-center gap-1.5">
          <User className="w-5 h-5 text-brand-600" />
          Coordonnées Personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nom Complet</label>
            <input 
              type="text" 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Numéro de Téléphone</label>
            <input 
              type="text" 
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Mot de Passe</label>
            <input 
              type="password" 
              disabled
              value={formData.password}
              className="w-full p-3 bg-slate-100 border border-slate-200 text-slate-400 rounded-xl text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <h3 className="font-bold text-slate-800 text-lg border-b border-slate-50 pb-3 pt-4 flex items-center gap-1.5">
          <MapPin className="w-5 h-5 text-brand-600" />
          Adresse de Livraison par Défaut
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1 md:col-span-3">
            <label className="text-xs font-bold text-slate-500 uppercase">Rue, avenue, étage, etc.</label>
            <input 
              type="text" 
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Code Postal</label>
            <input 
              type="text" 
              required
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Ville</label>
            <input 
              type="text" 
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Pays</label>
            <input 
              type="text" 
              required
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 focus:border-brand-500 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
          <button 
            type="submit"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
          >
            Enregistrer les modifications
          </button>
          {saved && (
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
              Modifications enregistrées !
            </span>
          )}
        </div>
      </form>
    </motion.div>
  );
};
