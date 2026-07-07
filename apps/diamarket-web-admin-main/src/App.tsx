import { useState } from "react";
import { Screen, Product, CartItem, Order, ReturnRequest, FAQItem } from "./types";
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_RETURNS, 
  INITIAL_FAQS 
} from "./data";
import { 
  AccueilClientScreen, BoutiqueScreen, BoutiqueElectroniqueScreen, 
  ParcourirCategoriesScreen, DetailsProduitScreen, VotrePanierScreen, 
  MaListeEnviesScreen, PaiementLivraisonScreen, RecapitulatifCommandeScreen, 
  ConfirmationCommandeScreen, MonProfilScreen, ParametresCompteScreen 
} from "./components/ClientScreens";
import { 
  TableauDeBordVendeurScreen, GestionCommandesScreen, DetailsCommandeScreen, 
  GestionInventaireScreen, GestionRetoursScreen, DetailsRetourScreen, 
  AideFAQScreen 
} from "./components/SellerScreens";
import { 
  ShoppingBag, Heart, User, Shield, HelpCircle, 
  ChevronRight, Settings, Store, ChevronDown, Check, Menu, X,
  Sun, Moon
} from "lucide-react";

export default function App() {
  // Navigation & Role States
  const [activeScreen, setActiveScreen] = useState<Screen>(Screen.AccueilClient);
  const [isSellerMode, setIsSellerMode] = useState<boolean>(false);
  const [showDemoPanel, setShowDemoPanel] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("aura-dark-mode") === "true";
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem("aura-dark-mode", String(newVal));
      return newVal;
    });
  };

  // Global Sync States
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [returns, setReturns] = useState<ReturnRequest[]>(INITIAL_RETURNS);
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

  // Selected details trackers
  const [currentProduct, setCurrentProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(INITIAL_ORDERS[0]);
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(INITIAL_RETURNS[0]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);

  // Forms states
  const [checkoutInfo, setCheckoutInfo] = useState<any>({
    fullName: "Camille Dubois",
    email: "camille.dubois@gmail.com",
    phone: "06 12 34 56 78",
    street: "18 Rue de la Paix",
    city: "Paris",
    postalCode: "75002",
    country: "France",
    shippingMethod: "Aura Express (Gratuit)",
    paymentMethod: "Carte Bancaire"
  });

  const [accountSettings, setAccountSettings] = useState<any>({
    fullName: "Camille Dubois",
    email: "camille.dubois@gmail.com",
    phone: "06 12 34 56 78",
    street: "18 Rue de la Paix",
    city: "Paris",
    postalCode: "75002",
    country: "France"
  });

  // Global helper functions
  const handleNavigate = (screen: Screen) => {
    setActiveScreen(screen);
    // Auto sync seller/client mode when navigating
    const sellerScreens = [
      Screen.TableauDeBordVendeur, Screen.GestionCommandes, Screen.DetailsCommande,
      Screen.GestionInventaire, Screen.GestionRetours, Screen.DetailsRetour, Screen.AideFAQ
    ];
    setIsSellerMode(sellerScreens.includes(screen));
  };

  const handleToggleRole = () => {
    if (isSellerMode) {
      handleNavigate(Screen.AccueilClient);
    } else {
      handleNavigate(Screen.TableauDeBordVendeur);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, qty: number, color?: string, size?: string) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += qty;
        return next;
      }
      return [...prev, { product, quantity: qty, selectedColor: color, selectedSize: size }];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleUpdateCartQty = (productId: string, qty: number) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item));
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Order submission
  const handlePlaceOrder = () => {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const deliveryCost = checkoutInfo.shippingMethod?.includes("Standard") ? 9.9 : 0;
    const total = subtotal + deliveryCost;

    const newOrder: Order = {
      id: `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: checkoutInfo.fullName || "Camille Dubois",
      email: checkoutInfo.email || "camille.dubois@gmail.com",
      phone: checkoutInfo.phone || "06 12 34 56 78",
      date: new Date().toISOString().split("T")[0],
      items: cart.map(it => ({ product: it.product, quantity: it.quantity, price: it.product.price })),
      subtotal,
      shippingCost: deliveryCost,
      taxCost: Math.round(subtotal * 0.2),
      total,
      status: "En attente",
      deliveryAddress: {
        fullName: checkoutInfo.fullName,
        street: checkoutInfo.street,
        city: checkoutInfo.city,
        postalCode: checkoutInfo.postalCode,
        country: checkoutInfo.country
      },
      shippingMethod: checkoutInfo.shippingMethod,
      paymentMethod: checkoutInfo.paymentMethod,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };

    setOrders(prev => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    setCart([]); // Clear cart
    handleNavigate(Screen.ConfirmationCommande);
  };

  // Seller modifications
  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateReturnStatus = (returnId: string, status: ReturnRequest["status"], comment?: string) => {
    setReturns(prev => prev.map(r => r.id === returnId ? { ...r, status, sellerComment: comment } : r));
    setSelectedReturn(prev => prev && prev.id === returnId ? { ...prev, status, sellerComment: comment } : prev);
  };

  const handleAddFAQ = (newFaq: FAQItem) => {
    setFaqs(prev => [...prev, newFaq]);
  };

  const handleAddReview = (productId: string, rating: number, comment: string, author: string) => {
    const newReview = {
      id: `rev-${Date.now()}`,
      author: author || "Client Anonyme",
      rating,
      comment,
      date: new Date().toISOString().split("T")[0]
    };

    setProducts(prevProducts => prevProducts.map(p => {
      if (p.id === productId) {
        const oldReviews = p.reviews || [];
        const updatedReviews = [newReview, ...oldReviews];
        const newReviewsCount = updatedReviews.length;
        const totalRatingSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvgRating = parseFloat((totalRatingSum / newReviewsCount).toFixed(1));
        
        return {
          ...p,
          reviews: updatedReviews,
          rating: newAvgRating,
          reviewsCount: newReviewsCount
        };
      }
      return p;
    }));

    if (currentProduct && currentProduct.id === productId) {
      setCurrentProduct(prev => {
        if (!prev) return null;
        const oldReviews = prev.reviews || [];
        const updatedReviews = [newReview, ...oldReviews];
        const newReviewsCount = updatedReviews.length;
        const totalRatingSum = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
        const newAvgRating = parseFloat((totalRatingSum / newReviewsCount).toFixed(1));
        return {
          ...prev,
          reviews: updatedReviews,
          rating: newAvgRating,
          reviewsCount: newReviewsCount
        };
      });
    }
  };

  // Total cart items badge count
  const cartBadgeCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? "dark" : ""}`} id="app-root-container">
      {/* 1. TOP HEADER / BRAND NAVIGATION */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => handleNavigate(Screen.AccueilClient)}
            className="flex items-center gap-2 cursor-pointer group"
            id="brand-logo-container"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 text-white flex items-center justify-center font-display font-black text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              A
            </div>
            <div>
              <span className="font-display font-black text-lg md:text-xl text-slate-900 tracking-tight block">AuraMarket</span>
              <span className="text-[9px] font-bold text-brand-600 tracking-widest uppercase block -mt-1">Collection d'Élite</span>
            </div>
          </div>

          {/* Customer Main Quick Navigation Links (Only visible when not in seller screens) */}
          {!isSellerMode && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
              <button 
                onClick={() => handleNavigate(Screen.AccueilClient)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.AccueilClient ? 'text-brand-600' : ''}`}
              >
                Accueil
              </button>
              <button 
                onClick={() => handleNavigate(Screen.Boutique)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.Boutique ? 'text-brand-600' : ''}`}
              >
                Boutique
              </button>
              <button 
                onClick={() => handleNavigate(Screen.BoutiqueElectronique)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.BoutiqueElectronique ? 'text-brand-600' : ''}`}
              >
                Électronique
              </button>
              <button 
                onClick={() => handleNavigate(Screen.ParcourirCategories)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.ParcourirCategories ? 'text-brand-600' : ''}`}
              >
                Catégories
              </button>
            </nav>
          )}

          {/* Seller Main Quick Links */}
          {isSellerMode && (
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
              <button 
                onClick={() => handleNavigate(Screen.TableauDeBordVendeur)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.TableauDeBordVendeur ? 'text-brand-600' : ''}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => handleNavigate(Screen.GestionCommandes)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.GestionCommandes || activeScreen === Screen.DetailsCommande ? 'text-brand-600' : ''}`}
              >
                Commandes
              </button>
              <button 
                onClick={() => handleNavigate(Screen.GestionInventaire)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.GestionInventaire ? 'text-brand-600' : ''}`}
              >
                Inventaire
              </button>
              <button 
                onClick={() => handleNavigate(Screen.GestionRetours)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.GestionRetours || activeScreen === Screen.DetailsRetour ? 'text-brand-600' : ''}`}
              >
                Retours
              </button>
              <button 
                onClick={() => handleNavigate(Screen.AideFAQ)}
                className={`hover:text-brand-600 transition-colors ${activeScreen === Screen.AideFAQ ? 'text-brand-600' : ''}`}
              >
                Aide & FAQ
              </button>
            </nav>
          )}

          {/* Quick Actions Panel & Mode Toggler */}
          <div className="flex items-center gap-3 md:gap-4">
            
            {/* Global Dark Mode Toggler */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              title={isDarkMode ? "Activer le mode clair" : "Activer le mode sombre"}
              id="header-dark-mode-toggle"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-400 fill-current" />
              ) : (
                <Moon className="w-5 h-5 text-slate-400" />
              )}
            </button>
            
            {/* Persona Role Mode Switcher Button */}
            <button 
              onClick={handleToggleRole}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-xs ${
                isSellerMode 
                  ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-brand-50 border-brand-100 text-brand-700 hover:bg-brand-100'
              }`}
              id="role-toggle-btn"
            >
              {isSellerMode ? (
                <>
                  <Store className="w-3.5 h-3.5 text-brand-300" />
                  <span className="hidden sm:inline">Mode Vendeur</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                  <span className="hidden sm:inline">Mode Client</span>
                </>
              )}
            </button>

            {/* Quick Badges (Client Side Only) */}
            {!isSellerMode && (
              <div className="flex items-center gap-1.5 md:gap-2">
                {/* Wishlist */}
                <button 
                  onClick={() => handleNavigate(Screen.MaListeEnvies)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-xl relative transition-all"
                  title="Liste d'envies"
                  id="header-wishlist-btn"
                >
                  <Heart className="w-5 h-5" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                {/* Shopping Cart */}
                <button 
                  onClick={() => handleNavigate(Screen.VotrePanier)}
                  className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-xl relative transition-all"
                  title="Votre panier"
                  id="header-cart-btn"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartBadgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-brand-600 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                      {cartBadgeCount}
                    </span>
                  )}
                </button>

                {/* Profile shortcut */}
                <button 
                  onClick={() => handleNavigate(Screen.MonProfil)}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
                  title="Mon Profil"
                  id="header-profile-btn"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN APPLICATION WORKSPACE CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Dynamic Screen Router Selection */}
        {activeScreen === Screen.AccueilClient && (
          <AccueilClientScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.Boutique && (
          <BoutiqueScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.BoutiqueElectronique && (
          <BoutiqueElectroniqueScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.ParcourirCategories && (
          <ParcourirCategoriesScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.DetailsProduit && (
          <DetailsProduitScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
            onAddReview={handleAddReview}
          />
        )}

        {activeScreen === Screen.VotrePanier && (
          <VotrePanierScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.MaListeEnvies && (
          <MaListeEnviesScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.PaiementLivraison && (
          <PaiementLivraisonScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.RecapitulatifCommande && (
          <RecapitulatifCommandeScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.ConfirmationCommande && (
          <ConfirmationCommandeScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.MonProfil && (
          <MonProfilScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {activeScreen === Screen.ParametresCompte && (
          <ParametresCompteScreen 
            onNavigate={handleNavigate}
            products={products}
            cart={cart}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            currentProduct={currentProduct}
            onSelectProduct={setCurrentProduct}
            checkoutInfo={checkoutInfo}
            onUpdateCheckoutInfo={setCheckoutInfo}
            orders={orders}
            onPlaceOrder={handlePlaceOrder}
            latestOrder={latestOrder}
            accountSettings={accountSettings}
            onUpdateAccountSettings={setAccountSettings}
          />
        )}

        {/* Seller screens router block */}
        {activeScreen === Screen.TableauDeBordVendeur && (
          <TableauDeBordVendeurScreen 
            onNavigate={handleNavigate}
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddProduct={handleAddProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            returns={returns}
            onUpdateReturnStatus={handleUpdateReturnStatus}
            selectedReturn={selectedReturn}
            onSelectReturn={setSelectedReturn}
            faqs={faqs}
            onAddFAQ={handleAddFAQ}
          />
        )}

        {activeScreen === Screen.GestionCommandes && (
          <GestionCommandesScreen 
            onNavigate={handleNavigate}
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddProduct={handleAddProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            returns={returns}
            onUpdateReturnStatus={handleUpdateReturnStatus}
            selectedReturn={selectedReturn}
            onSelectReturn={setSelectedReturn}
            faqs={faqs}
            onAddFAQ={handleAddFAQ}
          />
        )}

        {activeScreen === Screen.DetailsCommande && (
          <DetailsCommandeScreen 
            onNavigate={handleNavigate}
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddProduct={handleAddProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            returns={returns}
            onUpdateReturnStatus={handleUpdateReturnStatus}
            selectedReturn={selectedReturn}
            onSelectReturn={setSelectedReturn}
            faqs={faqs}
            onAddFAQ={handleAddFAQ}
          />
        )}

        {activeScreen === Screen.GestionInventaire && (
          <GestionInventaireScreen 
            onNavigate={handleNavigate}
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddProduct={handleAddProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            returns={returns}
            onUpdateReturnStatus={handleUpdateReturnStatus}
            selectedReturn={selectedReturn}
            onSelectReturn={setSelectedReturn}
            faqs={faqs}
            onAddFAQ={handleAddFAQ}
          />
        )}

        {activeScreen === Screen.GestionRetours && (
          <GestionRetoursScreen 
            onNavigate={handleNavigate}
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddProduct={handleAddProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            returns={returns}
            onUpdateReturnStatus={handleUpdateReturnStatus}
            selectedReturn={selectedReturn}
            onSelectReturn={setSelectedReturn}
            faqs={faqs}
            onAddFAQ={handleAddFAQ}
          />
        )}

        {activeScreen === Screen.DetailsRetour && (
          <DetailsRetourScreen 
            onNavigate={handleNavigate}
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddProduct={handleAddProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            returns={returns}
            onUpdateReturnStatus={handleUpdateReturnStatus}
            selectedReturn={selectedReturn}
            onSelectReturn={setSelectedReturn}
            faqs={faqs}
            onAddFAQ={handleAddFAQ}
          />
        )}

        {activeScreen === Screen.AideFAQ && (
          <AideFAQScreen 
            onNavigate={handleNavigate}
            products={products}
            onUpdateProductStock={handleUpdateProductStock}
            onAddProduct={handleAddProduct}
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            selectedOrder={selectedOrder}
            onSelectOrder={setSelectedOrder}
            returns={returns}
            onUpdateReturnStatus={handleUpdateReturnStatus}
            selectedReturn={selectedReturn}
            onSelectReturn={setSelectedReturn}
            faqs={faqs}
            onAddFAQ={handleAddFAQ}
          />
        )}
      </main>

      {/* 3. PERSISTENT DEMO FLOATING CONTROLLER FOR REVIEWING ALL 19 SCREENS */}
      <div className="fixed bottom-4 left-4 z-50">
        {showDemoPanel ? (
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 w-72 max-h-96 flex flex-col space-y-3 overflow-hidden transition-all">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                <h4 className="font-display font-extrabold text-xs tracking-wide text-brand-300 uppercase">Sélecteur de Démo</h4>
              </div>
              <button 
                onClick={() => setShowDemoPanel(false)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                title="Masquer le panneau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 text-[11px] font-medium text-slate-400">
              {/* Espace Client */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block px-1">Espace Client (12 écrans)</span>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { screen: Screen.AccueilClient, label: "1. Accueil Client" },
                    { screen: Screen.Boutique, label: "2. Boutique : Liste Produits" },
                    { screen: Screen.BoutiqueElectronique, label: "3. Boutique Électronique" },
                    { screen: Screen.ParcourirCategories, label: "4. Parcourir les Catégories" },
                    { screen: Screen.DetailsProduit, label: "5. Détails du Produit" },
                    { screen: Screen.VotrePanier, label: "6. Votre Panier" },
                    { screen: Screen.MaListeEnvies, label: "7. Ma Liste d'Envies" },
                    { screen: Screen.PaiementLivraison, label: "8. Paiement et Livraison" },
                    { screen: Screen.RecapitulatifCommande, label: "9. Récapitulatif Commande" },
                    { screen: Screen.ConfirmationCommande, label: "10. Confirmation de Commande" },
                    { screen: Screen.MonProfil, label: "11. Mon Profil" },
                    { screen: Screen.ParametresCompte, label: "12. Paramètres du Compte" }
                  ].map(it => (
                    <button 
                      key={it.screen}
                      onClick={() => handleNavigate(it.screen)}
                      className={`py-1.5 px-2.5 rounded-lg text-left transition-colors flex items-center justify-between ${
                        activeScreen === it.screen 
                          ? "bg-brand-600 text-white font-bold" 
                          : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <span>{it.label}</span>
                      {activeScreen === it.screen && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Espace Vendeur */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block px-1">Espace Vendeur (7 écrans)</span>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { screen: Screen.TableauDeBordVendeur, label: "13. Tableau de Bord Vendeur" },
                    { screen: Screen.GestionCommandes, label: "14. Gestion des Commandes" },
                    { screen: Screen.DetailsCommande, label: "15. Détails de la Commande" },
                    { screen: Screen.GestionInventaire, label: "16. Gestion de l'Inventaire" },
                    { screen: Screen.GestionRetours, label: "17. Gestion des Retours" },
                    { screen: Screen.DetailsRetour, label: "18. Détails du Retour" },
                    { screen: Screen.AideFAQ, label: "19. Aide et FAQ" }
                  ].map(it => (
                    <button 
                      key={it.screen}
                      onClick={() => handleNavigate(it.screen)}
                      className={`py-1.5 px-2.5 rounded-lg text-left transition-colors flex items-center justify-between ${
                        activeScreen === it.screen 
                          ? "bg-slate-700 text-white font-bold" 
                          : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <span>{it.label}</span>
                      {activeScreen === it.screen && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setShowDemoPanel(true)}
            className="p-3 rounded-full bg-slate-900 text-white border border-slate-800 hover:bg-slate-800 transition-all flex items-center justify-center shadow-2xl"
            title="Afficher le panneau de démo"
            id="show-demo-panel-btn"
          >
            <Menu className="w-5 h-5 text-brand-400" />
          </button>
        )}
      </div>

      {/* 4. BRAND FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© 2026 AuraMarket. Tous droits réservés.</p>
          <div className="flex gap-4">
            <button onClick={() => handleNavigate(Screen.AccueilClient)} className="hover:text-slate-600 transition-colors">Espace Client</button>
            <span>•</span>
            <button onClick={() => handleNavigate(Screen.TableauDeBordVendeur)} className="hover:text-slate-600 transition-colors">Espace Vendeur</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

