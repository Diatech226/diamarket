import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  MapPin, 
  User, 
  CreditCard, 
  FileText, 
  HelpCircle, 
  Bell, 
  PlusCircle, 
  ClipboardList, 
  Plane, 
  AlertTriangle, 
  Menu, 
  X, 
  ChevronRight, 
  ShieldCheck,
  Building2,
  Sun,
  Moon
} from 'lucide-react';
import { 
  ScreenType, 
  Shipment, 
  Address, 
  NotificationItem, 
  SupportTicket, 
  DocumentItem, 
  InvoiceItem, 
  UserProfile 
} from './types';
import { 
  INITIAL_PROFILE, 
  INITIAL_ADDRESSES, 
  INITIAL_SHIPMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_TICKETS, 
  INITIAL_DOCUMENTS, 
  INITIAL_INVOICES 
} from './data';

// Component Imports
import ScreenAccueil from './components/ScreenAccueil';
import ScreenNotifications from './components/ScreenNotifications';
import ScreenAide from './components/ScreenAide';
import ScreenShipmentWizard from './components/ScreenShipmentWizard';
import ScreenNouveauTicket from './components/ScreenNouveauTicket';
import ScreenFretAerien from './components/ScreenFretAerien';
import ScreenProfil from './components/ScreenProfil';
import ScreenAdresses from './components/ScreenAdresses';
import ScreenDetailsExp from './components/ScreenDetailsExp';
import ScreenDocuments from './components/ScreenDocuments';
import ScreenPaiements from './components/ScreenPaiements';
import ScreenDevis from './components/ScreenDevis';
import ScreenLitige from './components/ScreenLitige';
import ScreenTableauBord from './components/ScreenTableauBord';

export default function App() {
  // --- Persistent Local Storage Hooks ---
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(() => {
    return (localStorage.getItem('dia_screen') as ScreenType) || 'accueil';
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('dia_theme') as 'light' | 'dark') || 'dark';
  });

  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(() => {
    return localStorage.getItem('dia_selected_shipment');
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dia_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('dia_addresses');
    return saved ? JSON.parse(saved) : INITIAL_ADDRESSES;
  });

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem('dia_shipments');
    return saved ? JSON.parse(saved) : INITIAL_SHIPMENTS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('dia_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('dia_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('dia_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    const saved = localStorage.getItem('dia_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  // Mobile menu control
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Synchronization to Local Storage ---
  useEffect(() => {
    localStorage.setItem('dia_screen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    localStorage.setItem('dia_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (selectedShipmentId) {
      localStorage.setItem('dia_selected_shipment', selectedShipmentId);
    } else {
      localStorage.removeItem('dia_selected_shipment');
    }
  }, [selectedShipmentId]);

  useEffect(() => {
    localStorage.setItem('dia_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('dia_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('dia_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('dia_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('dia_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('dia_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('dia_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // --- Navigation Wrapper (Closes mobile menu) ---
  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectShipment = (id: string | null) => {
    setSelectedShipmentId(id);
  };

  // --- Callbacks for State Mutations ---
  const handleAddShipment = (ship: Shipment) => {
    setShipments((prev) => [ship, ...prev]);

    // Generate Invoice for the shipment
    const newInvoice: InvoiceItem = {
      id: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      amount: ship.totalCost,
      status: 'paye', // paid on confirmation
      date: ship.date,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shipmentId: ship.id,
      trackingNumber: ship.trackingNumber
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // Create custom notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: "Expédition créée",
      message: `Votre expédition ${ship.trackingNumber} de ${ship.senderCity} à ${ship.receiverCity} est en cours de préparation.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'success',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleAddAddress = (addr: Address) => {
    setAddresses((prev) => [addr, ...prev]);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);

    // If attached to a blocked shipment, automatically change status of shipment to "douane_ok"!
    if (doc.shipmentId) {
      setShipments((prev) =>
        prev.map((ship) => {
          if (ship.id === doc.shipmentId && ship.status === 'douane_bloque') {
            // Add progress update to tracking list
            const updatedHistory = [
              {
                status: 'douane_ok',
                label: 'Dédouanement validé',
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                location: 'Paris Roissy CDG, France',
                description: `Facture commerciale validée par l'agent OEA. Colis libéré pour acheminement.`
              },
              ...ship.statusHistory
            ];
            
            // Push Notification
            const customNotif: NotificationItem = {
              id: `notif-auto-${Date.now()}`,
              title: "Dédouanement validé !",
              message: `Le document '${doc.name}' a débloqué votre colis ${ship.trackingNumber}. Transit relancé.`,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              type: 'success',
              read: false
            };
            setNotifications((prevNotif) => [customNotif, ...prevNotif]);

            return {
              ...ship,
              status: 'transit',
              statusHistory: updatedHistory
            } as Shipment;
          }
          return ship;
        })
      );
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddTicket = (tkt: SupportTicket) => {
    setTickets((prev) => [tkt, ...prev]);
  };

  const handleAddResponse = (ticketId: string, message: string) => {
    setTickets((prev) =>
      prev.map((tkt) => {
        if (tkt.id === ticketId) {
          const updatedResp = [
            ...tkt.responses,
            {
              sender: 'user' as const,
              message,
              date: new Date().toISOString().replace('T', ' ').substring(0, 16)
            }
          ];
          
          // Trigger automatic supportive reply from a simulated freight supervisor after 1.5 seconds!
          setTimeout(() => {
            setTickets((latestTickets) =>
              latestTickets.map((latestTkt) => {
                if (latestTkt.id === ticketId) {
                  return {
                    ...latestTkt,
                    status: 'en_cours',
                    responses: [
                      ...latestTkt.responses,
                      {
                        sender: 'support' as const,
                        message: "Merci pour ces précisions, Monsieur Dupont. Nos déclarants en douane analysent les pièces jointes à l'instant même.",
                        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                      }
                    ]
                  };
                }
                return latestTkt;
              })
            );
          }, 1500);

          return {
            ...tkt,
            responses: updatedResp
          };
        }
        return tkt;
      })
    );
  };

  const handlePayInvoice = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'paye' } : inv))
    );
  };

  const handleRaiseDispute = (shipmentId: string, description: string, amount: number) => {
    setShipments((prev) =>
      prev.map((ship) => {
        if (ship.id === shipmentId) {
          const updatedHistory = [
            {
              status: 'litige',
              label: 'Litige déclaré',
              date: new Date().toISOString().replace('T', ' ').substring(0, 16),
              location: ship.statusHistory[0]?.location || 'Plateforme Client',
              description: `Réclamation sinistre enregistrée : ${description}. Indemnisation demandée : ${amount} €.`
            },
            ...ship.statusHistory
          ];
          return {
            ...ship,
            status: 'litige',
            statusHistory: updatedHistory
          } as Shipment;
        }
        return ship;
      })
    );

    // Create associated support ticket automatically
    const ship = shipments.find(s => s.id === shipmentId);
    const trackingNum = ship ? ship.trackingNumber : 'DIA-COLIS';
    const autoTicket: SupportTicket = {
      id: `TKT-CLAIM-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: `Litige Sinistre pour colis ${trackingNum}`,
      category: 'colis_endommage',
      description: `Déclaration automatique de litige : ${description}. Demande de remboursement de ${amount} €`,
      status: 'ouvert',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      urgency: 'elevee',
      responses: [
        {
          sender: 'user',
          message: `Détails de réclamation : ${description}. Indemnisation demandée : ${amount} €.`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        }
      ]
    };
    setTickets((prev) => [autoTicket, ...prev]);

    // Create Notification
    const autoNotif: NotificationItem = {
      id: `notif-dispute-${Date.now()}`,
      title: "Litige enregistré",
      message: `Votre demande de sinistre sur le colis ${trackingNum} a été transmise à notre service d'indemnisation AXA.`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: 'warning',
      read: false
    };
    setNotifications((prev) => [autoNotif, ...prev]);
  };

  const handleUpdateProfile = (prof: UserProfile) => {
    setProfile(prof);
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Badge notification count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased" id="diaexpress-app-shell">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 lg:hidden cursor-pointer"
              title="Menu principal"
              id="btn-mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo Brand */}
            <div
              onClick={() => handleNavigate('accueil')}
              className="flex items-center gap-2 cursor-pointer group"
              id="brand-logo-container"
            >
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-black text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  DiaExpress
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-600 ml-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100">
                  Transitaire Agréé
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Right actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
              id="btn-theme-toggle"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-indigo-600" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </button>

            {/* Notifications Badge */}
            <button
              onClick={() => handleNavigate('notifications')}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              title="Notifications"
              id="btn-header-notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile widget */}
            <div
              onClick={() => handleNavigate('profil')}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              id="header-profile-trigger"
            >
              <img
                src={profile.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-indigo-100"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">{profile.name}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CONTENT) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto relative">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-slate-150 p-4 space-y-7 h-[calc(100vh-62px)] sticky top-[62px] overflow-y-auto">
          {/* Main sections */}
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2">Opérations</span>
            <button
              onClick={() => handleNavigate('accueil')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'accueil' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Package className="w-4.5 h-4.5" /> Accueil - DiaExpress
            </button>

            <button
              onClick={() => handleNavigate('tableau-bord')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'tableau-bord' || currentScreen === 'details-exp' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4.5 h-4.5" /> Tableau de Bord
            </button>

            <button
              onClick={() => handleNavigate('creer-itineraire')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'creer-itineraire' || currentScreen === 'creer-service' || currentScreen === 'creer-douane' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4.5 h-4.5" /> Créer une expédition
            </button>

            <button
              onClick={() => handleNavigate('devis')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'devis' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4.5 h-4.5" /> Demander un devis
            </button>

            <button
              onClick={() => handleNavigate('fret-aerien')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'fret-aerien' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Plane className="w-4.5 h-4.5" /> Fret Aérien
            </button>
          </div>

          {/* Documents and Invoices */}
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2">Transit & Fiscalité</span>
            <button
              onClick={() => handleNavigate('documents')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'documents' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4.5 h-4.5" /> Gestion Documents
            </button>

            <button
              onClick={() => handleNavigate('paiements')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'paiements' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-4.5 h-4.5" /> Paiements
            </button>

            <button
              onClick={() => handleNavigate('litige')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'litige' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-4.5 h-4.5" /> Déclarer un litige
            </button>
          </div>

          {/* Directory Book & User */}
          <div className="space-y-1">
            <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2">Paramètres</span>
            <button
              onClick={() => handleNavigate('adresses')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'adresses' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4.5 h-4.5" /> Mes Adresses
            </button>

            <button
              onClick={() => handleNavigate('profil')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'profil' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="w-4.5 h-4.5" /> Mon Profil
            </button>

            <button
              onClick={() => handleNavigate('aide')}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                currentScreen === 'aide' || currentScreen === 'nouveau-ticket' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4.5 h-4.5" /> Centre d'Aide
            </button>
          </div>

          {/* Certification Label */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-600" />
              <span className="text-[10px] font-bold text-indigo-950 font-display uppercase">Opérateur OEA</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">
              DiaExpress détient la certification douanière officielle d'opérateur économique agréé.
            </p>
          </div>
        </aside>

        {/* MOBILE OVERLAY DRAWER NAVIGATION */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden flex">
            <motion.div
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              className="bg-white w-64 p-4 space-y-6 flex flex-col justify-between h-full shadow-2xl border-r border-slate-150"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className="font-display font-bold text-slate-800">Menu DiaExpress</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-800"
                    title="Fermer le menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2">Navigation</span>
                  {[
                    { screen: 'accueil', icon: <Package className="w-4 h-4" />, label: 'Accueil - DiaExpress' },
                    { screen: 'tableau-bord', icon: <ClipboardList className="w-4 h-4" />, label: 'Tableau de Bord' },
                    { screen: 'creer-itineraire', icon: <PlusCircle className="w-4 h-4" />, label: 'Créer une expédition' },
                    { screen: 'devis', icon: <ClipboardList className="w-4 h-4" />, label: 'Demander un devis' },
                    { screen: 'fret-aerien', icon: <Plane className="w-4 h-4" />, label: 'Fret Aérien' },
                    { screen: 'documents', icon: <FileText className="w-4 h-4" />, label: 'Gestion Documents' },
                    { screen: 'paiements', icon: <CreditCard className="w-4 h-4" />, label: 'Paiements' },
                    { screen: 'litige', icon: <AlertTriangle className="w-4 h-4" />, label: 'Déclarer un litige' },
                    { screen: 'adresses', icon: <MapPin className="w-4 h-4" />, label: 'Mes Adresses' },
                    { screen: 'profil', icon: <User className="w-4 h-4" />, label: 'Mon Profil' },
                    { screen: 'aide', icon: <HelpCircle className="w-4 h-4" />, label: "Centre d'Aide" }
                  ].map((item) => (
                    <button
                      key={item.screen}
                      onClick={() => handleNavigate(item.screen as any)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                        currentScreen === item.screen ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certification bottom */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span className="text-[10px] font-bold text-indigo-950 uppercase">DiaExpress OEA</span>
                </div>
                <p className="text-[9px] text-slate-500">
                  Services de commissionnaire agréé en douane.
                </p>
              </div>
            </motion.div>

            {/* Tap backdrop to close */}
            <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
          </div>
        )}

        {/* 3. PRIMARY CONTENT ROUTER CONTAINER */}
        <main className="flex-1 min-w-0 bg-slate-50/50 pb-12 overflow-y-auto">
          {currentScreen === 'accueil' && (
            <ScreenAccueil
              onNavigate={handleNavigate}
              profile={profile}
              shipments={shipments}
              onSelectShipment={handleSelectShipment}
            />
          )}

          {currentScreen === 'notifications' && (
            <ScreenNotifications
              notifications={notifications}
              onNavigate={handleNavigate}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onClearNotifications={handleClearNotifications}
            />
          )}

          {currentScreen === 'aide' && (
            <ScreenAide
              onNavigate={handleNavigate}
              tickets={tickets}
              onAddResponse={handleAddResponse}
            />
          )}

          {/* 3-Step creation flow wrapper (Itinéraire, Service, Douane/Taxes) */}
          {(currentScreen === 'creer-itineraire' || currentScreen === 'creer-service' || currentScreen === 'creer-douane') && (
            <ScreenShipmentWizard
              step={currentScreen === 'creer-itineraire' ? 'itineraire' : currentScreen === 'creer-service' ? 'service' : 'douane'}
              onNavigate={handleNavigate}
              addresses={addresses}
              onAddShipment={handleAddShipment}
            />
          )}

          {currentScreen === 'nouveau-ticket' && (
            <ScreenNouveauTicket
              onNavigate={handleNavigate}
              onAddTicket={handleAddTicket}
            />
          )}

          {currentScreen === 'fret-aerien' && (
            <ScreenFretAerien
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'profil' && (
            <ScreenProfil
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'adresses' && (
            <ScreenAdresses
              addresses={addresses}
              onAddAddress={handleAddAddress}
              onDeleteAddress={handleDeleteAddress}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'details-exp' && (
            <ScreenDetailsExp
              shipmentId={selectedShipmentId}
              shipments={shipments}
              documents={documents}
              onNavigate={handleNavigate}
              onSelectShipment={handleSelectShipment}
            />
          )}

          {currentScreen === 'documents' && (
            <ScreenDocuments
              documents={documents}
              shipments={shipments}
              onAddDocument={handleAddDocument}
              onDeleteDocument={handleDeleteDocument}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'paiements' && (
            <ScreenPaiements
              invoices={invoices}
              onPayInvoice={handlePayInvoice}
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'devis' && (
            <ScreenDevis
              onNavigate={handleNavigate}
            />
          )}

          {currentScreen === 'litige' && (
            <ScreenLitige
              shipments={shipments}
              onNavigate={handleNavigate}
              onRaiseDispute={handleRaiseDispute}
            />
          )}

          {currentScreen === 'tableau-bord' && (
            <ScreenTableauBord
              shipments={shipments}
              onSelectShipment={handleSelectShipment}
              onNavigate={handleNavigate}
            />
          )}
        </main>
      </div>
    </div>
  );
}
