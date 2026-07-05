/**
 * DiaExpress Types & Models
 */

export type ScreenType =
  | 'accueil'
  | 'notifications'
  | 'aide'
  | 'creer-itineraire'
  | 'nouveau-ticket'
  | 'fret-aerien'
  | 'profil'
  | 'adresses'
  | 'details-exp'
  | 'creer-douane'
  | 'documents'
  | 'paiements'
  | 'creer-service'
  | 'devis'
  | 'litige'
  | 'tableau-bord';

export interface Address {
  id: string;
  label: string;
  name: string;
  addressLine: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderPostalCode: string;
  senderCountry: string;
  receiverName: string;
  receiverAddress: string;
  receiverCity: string;
  receiverPostalCode: string;
  receiverCountry: string;
  serviceType: 'standard' | 'premium' | 'air';
  status: 'preparation' | 'transit' | 'douane_bloque' | 'douane_ok' | 'livraison' | 'livre' | 'litige';
  date: string;
  weight: number; // in kg
  length?: number;
  width?: number;
  height?: number;
  declaredValue: number; // in EUR
  customsDuty: number; // in EUR
  tva: number; // in EUR
  totalCost: number; // in EUR
  description: string;
  statusHistory: {
    status: string;
    label: string;
    date: string;
    location: string;
    description: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: 'facturation' | 'retard' | 'colis_endommage' | 'autre';
  description: string;
  status: 'ouvert' | 'en_cours' | 'resolu';
  date: string;
  urgency: 'faible' | 'moyenne' | 'elevee';
  responses: {
    sender: 'user' | 'support';
    message: string;
    date: string;
  }[];
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  shipmentId?: string;
  fileUrl?: string;
}

export interface InvoiceItem {
  id: string;
  amount: number;
  status: 'paye' | 'en_attente' | 'en_retard';
  date: string;
  dueDate: string;
  shipmentId: string;
  trackingNumber: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  company: string;
  language: 'fr' | 'en';
  currency: 'EUR' | 'USD';
  avatarUrl?: string;
}
