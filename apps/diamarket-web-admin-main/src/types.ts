export enum Screen {
  AccueilClient = "accueil-client",
  ConfirmationCommande = "confirmation-commande",
  GestionCommandes = "gestion-commandes",
  Boutique = "boutique",
  DetailsRetour = "details-retour",
  ParcourirCategories = "parcourir-categories",
  GestionRetours = "gestion-retours",
  BoutiqueElectronique = "boutique-electronique",
  VotrePanier = "votre-panier",
  RecapitulatifCommande = "recapitulatif-commande",
  MonProfil = "mon-profil",
  DetailsCommande = "details-commande",
  DetailsProduit = "details-produit",
  MaListeEnvies = "ma-liste-envies",
  PaiementLivraison = "paiement-livraison",
  TableauDeBordVendeur = "tableau-de-bord-vendeur",
  GestionInventaire = "gestion-inventaire",
  ParametresCompte = "parametres-compte",
  AideFAQ = "aide-faq"
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: string;
  stock: number;
  isElectronic?: boolean;
  features: string[];
  specs: Record<string, string>;
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxCost: number;
  total: number;
  status: "En attente" | "Préparé" | "Expédié" | "Livré" | "Annulé";
  deliveryAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  shippingMethod: string;
  paymentMethod: string;
  estimatedDelivery: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  date: string;
  product: Product;
  quantity: number;
  reason: string;
  description: string;
  status: "En attente" | "Approuvé" | "Rejeté";
  refundAmount: number;
  images?: string[];
  sellerComment?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "Général" | "Commandes" | "Livraison" | "Retours" | "Paiements";
}
