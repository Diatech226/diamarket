import { Shipment, Address, NotificationItem, SupportTicket, DocumentItem, InvoiceItem, UserProfile } from './types';

export const INITIAL_PROFILE: UserProfile = {
  name: "Jean Dupont",
  email: "jean.dupont@entreprise.fr",
  phone: "+33 6 12 34 56 78",
  company: "Dupont & Associés Logistics",
  language: "fr",
  currency: "EUR",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
};

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Siège Social Paris",
    name: "Dupont Industries",
    addressLine: "45 Avenue des Champs-Élysées",
    city: "Paris",
    postalCode: "75008",
    country: "France",
    phone: "+33 1 45 67 89 00"
  },
  {
    id: "addr-2",
    label: "Entrepôt Logistique Lyon",
    name: "Logistique Rhône-Alpes",
    addressLine: "12 Rue de la République",
    city: "Lyon",
    postalCode: "69002",
    country: "France",
    phone: "+33 4 72 34 56 78"
  },
  {
    id: "addr-3",
    label: "Filiale Francfort",
    name: "Dupont GmbH",
    addressLine: "Kaiserstraße 15",
    city: "Francfort",
    postalCode: "60311",
    country: "Allemagne",
    phone: "+49 69 1234 5678"
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: "ship-1",
    trackingNumber: "DIA-2026-001",
    senderName: "Dupont Industries (Jean Dupont)",
    senderAddress: "45 Avenue des Champs-Élysées",
    senderCity: "Paris",
    senderPostalCode: "75008",
    senderCountry: "France",
    receiverName: "Global Tech Inc.",
    receiverAddress: "101 California St",
    receiverCity: "San Francisco",
    receiverPostalCode: "94111",
    receiverCountry: "États-Unis",
    serviceType: "air",
    status: "livre",
    date: "2026-06-28",
    weight: 12.5,
    length: 40,
    width: 30,
    height: 25,
    declaredValue: 2450,
    customsDuty: 122.5,
    tva: 490,
    totalCost: 320,
    description: "Composants électroniques haute précision",
    statusHistory: [
      {
        status: "livre",
        label: "Livré",
        date: "2026-07-02 14:30",
        location: "San Francisco, USA",
        description: "Colis livré en main propre. Signature : J. Smith."
      },
      {
        status: "livraison",
        label: "En cours de livraison",
        date: "2026-07-02 09:00",
        location: "San Francisco, USA",
        description: "Le colis est dans le véhicule de livraison."
      },
      {
        status: "douane_ok",
        label: "Dédouanement réussi",
        date: "2026-07-01 11:15",
        location: "Douane de San Francisco, USA",
        description: "Inspection douanière terminée avec succès. Droits de douane acquittés."
      },
      {
        status: "transit",
        label: "En transit international",
        date: "2026-06-29 22:40",
        location: "Aéroport Paris CDG, France",
        description: "Expédié par le vol cargo AF084 à destination de San Francisco."
      },
      {
        status: "preparation",
        label: "Colis pris en charge",
        date: "2026-06-28 16:15",
        location: "Agence Paris Centre, France",
        description: "Le colis a été étiqueté et préparé pour l'expédition."
      }
    ]
  },
  {
    id: "ship-2",
    trackingNumber: "DIA-2026-002",
    senderName: "Dupont Industries",
    senderAddress: "45 Avenue des Champs-Élysées",
    senderCity: "Paris",
    senderPostalCode: "75008",
    senderCountry: "France",
    receiverName: "Logistique Rhône-Alpes",
    receiverAddress: "12 Rue de la République",
    receiverCity: "Lyon",
    receiverPostalCode: "69002",
    receiverCountry: "France",
    serviceType: "standard",
    status: "transit",
    date: "2026-07-03",
    weight: 24.0,
    length: 60,
    width: 40,
    height: 40,
    declaredValue: 450,
    customsDuty: 0,
    tva: 90,
    totalCost: 45.90,
    description: "Catalogues marketing & goodies d'entreprise",
    statusHistory: [
      {
        status: "transit",
        label: "En transit",
        date: "2026-07-04 18:30",
        location: "Plateforme Centre (Nevers), France",
        description: "Colis trié et acheminé vers le centre de distribution régional de Lyon."
      },
      {
        status: "preparation",
        label: "Colis pris en charge",
        date: "2026-07-03 10:00",
        location: "Agence Paris Centre, France",
        description: "Le colis a été récupéré par notre coursier."
      }
    ]
  },
  {
    id: "ship-3",
    trackingNumber: "DIA-2026-003",
    senderName: "Tokyo Robotics Ltd",
    senderAddress: "2-1-1 Nihonbashi",
    senderCity: "Tokyo",
    senderPostalCode: "103-0027",
    senderCountry: "Japon",
    receiverName: "Dupont Industries",
    receiverAddress: "45 Avenue des Champs-Élysées",
    receiverCity: "Paris",
    receiverPostalCode: "75008",
    receiverCountry: "France",
    serviceType: "premium",
    status: "douane_bloque",
    date: "2026-07-02",
    weight: 4.8,
    length: 30,
    width: 20,
    height: 15,
    declaredValue: 8500,
    customsDuty: 425,
    tva: 1700,
    totalCost: 195.00,
    description: "Prototype de capteur LIDAR pour tests R&D",
    statusHistory: [
      {
        status: "douane_bloque",
        label: "Retenu en douane - Documents manquants",
        date: "2026-07-04 09:20",
        location: "Douane de Paris Roissy CDG, France",
        description: "En attente de la facture commerciale détaillée et de la déclaration d'origine. Veuillez soumettre les documents requis."
      },
      {
        status: "transit",
        label: "Arrivé dans le pays de destination",
        date: "2026-07-03 23:50",
        location: "Aéroport Paris CDG, France",
        description: "Le vol cargo NH805 transportant le colis a atterri."
      },
      {
        status: "transit",
        label: "En transit",
        date: "2026-07-02 21:00",
        location: "Tokyo Narita, Japon",
        description: "Colis chargé dans l'avion cargo."
      },
      {
        status: "preparation",
        label: "Pris en charge à l'étranger",
        date: "2026-07-02 11:30",
        location: "Tokyo Agence Centrale, Japon",
        description: "Pris en charge et expédié avec DiaExpress Global Service."
      }
    ]
  },
  {
    id: "ship-4",
    trackingNumber: "DIA-2026-004",
    senderName: "Dupont Industries",
    senderAddress: "45 Avenue des Champs-Élysées",
    senderCity: "Paris",
    senderPostalCode: "75008",
    senderCountry: "France",
    receiverName: "Müller Logistics",
    receiverAddress: "Berliner Allee 42",
    receiverCity: "Düsseldorf",
    receiverPostalCode: "40212",
    receiverCountry: "Allemagne",
    serviceType: "premium",
    status: "livraison",
    date: "2026-07-04",
    weight: 8.2,
    length: 35,
    width: 35,
    height: 30,
    declaredValue: 980,
    customsDuty: 0,
    tva: 196,
    totalCost: 84.50,
    description: "Pièces mécaniques de rechange pour compresseur",
    statusHistory: [
      {
        status: "livraison",
        label: "En cours de livraison",
        date: "2026-07-05 08:15",
        location: "Düsseldorf, Allemagne",
        description: "Le colis est en cours de livraison par notre partenaire local."
      },
      {
        status: "transit",
        label: "En transit",
        date: "2026-07-04 19:30",
        location: "Centre de tri de Francfort, Allemagne",
        description: "Acheminé vers le dépôt de destination de Düsseldorf."
      },
      {
        status: "preparation",
        label: "Colis expédié",
        date: "2026-07-04 11:00",
        location: "Agence Paris Centre, France",
        description: "Pris en charge et expédié."
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Action requise - Douane",
    message: "Votre envoi DIA-2026-003 en provenance de Tokyo est retenu en douane à Paris CDG. Veuillez téléverser la facture commerciale.",
    date: "2026-07-04 09:25",
    type: "warning",
    read: false
  },
  {
    id: "notif-2",
    title: "Livraison Confirmée",
    message: "Félicitations, l'expédition DIA-2026-001 à destination de San Francisco a été livrée avec succès.",
    date: "2026-07-02 14:35",
    type: "success",
    read: false
  },
  {
    id: "notif-3",
    title: "Nouveau message support",
    message: "Le support DiaExpress a répondu à votre ticket #TKT-4928 concernant votre retard de livraison.",
    date: "2026-07-04 14:10",
    type: "info",
    read: true
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: "TKT-4928",
    subject: "Retard de dédouanement DIA-2026-003",
    category: "retard",
    description: "Bonjour, mon colis contenant le capteur R&D est bloqué en douane depuis hier matin. Est-ce qu'il y a des documents manquants de ma part ?",
    status: "en_cours",
    date: "2026-07-04 10:15",
    urgency: "elevee",
    responses: [
      {
        sender: "user",
        message: "Bonjour, mon colis contenant le capteur R&D est bloqué en douane depuis hier matin. Est-ce qu'il y a des documents manquants de ma part ?",
        date: "2026-07-04 10:15"
      },
      {
        sender: "support",
        message: "Bonjour Monsieur Dupont, effectivement, la douane exige la Facture Commerciale originale avec le numéro de tarif douanier HS Code. Vous pouvez la téléverser directement dans l'onglet 'Gestion des Documents' rattaché à ce colis pour débloquer la situation.",
        date: "2026-07-04 14:08"
      }
    ]
  },
  {
    id: "TKT-3829",
    subject: "Demande d'ajustement de facture",
    category: "facturation",
    description: "Bonjour, j'ai constaté une erreur de facturation sur la facture INV-2026-001. Le taux de TVA appliqué est erroné.",
    status: "resolu",
    date: "2026-06-29 09:00",
    urgency: "moyenne",
    responses: [
      {
        sender: "user",
        message: "Bonjour, j'ai constaté une erreur de facturation sur la facture INV-2026-001. Le taux de TVA appliqué est erroné.",
        date: "2026-06-29 09:00"
      },
      {
        sender: "support",
        message: "Bonjour, nous avons corrigé la facture et ré-émis le document sous le code INV-2026-001-REV avec la TVA exonérée pour l'export international.",
        date: "2026-06-30 15:45"
      }
    ]
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    name: "Facture_Commerciale_GlobalTech_DIA-001.pdf",
    type: "Facture Commerciale",
    size: "342 KB",
    uploadDate: "2026-06-28",
    shipmentId: "ship-1"
  },
  {
    id: "doc-2",
    name: "Liste_Colisage_DIA-001.pdf",
    type: "Packing List",
    size: "185 KB",
    uploadDate: "2026-06-28",
    shipmentId: "ship-1"
  },
  {
    id: "doc-3",
    name: "Air_Waybill_NH805_DIA-003.pdf",
    type: "Lettre de Voiture (AWB)",
    size: "520 KB",
    uploadDate: "2026-07-02",
    shipmentId: "ship-3"
  }
];

export const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: "INV-2026-001",
    amount: 320.00,
    status: "paye",
    date: "2026-06-28",
    dueDate: "2026-07-28",
    shipmentId: "ship-1",
    trackingNumber: "DIA-2026-001"
  },
  {
    id: "INV-2026-002",
    amount: 45.90,
    status: "paye",
    date: "2026-07-03",
    dueDate: "2026-08-03",
    shipmentId: "ship-2",
    trackingNumber: "DIA-2026-002"
  },
  {
    id: "INV-2026-003",
    amount: 195.00,
    status: "en_attente",
    date: "2026-07-02",
    dueDate: "2026-08-02",
    shipmentId: "ship-3",
    trackingNumber: "DIA-2026-003"
  },
  {
    id: "INV-2026-004",
    amount: 84.50,
    status: "en_attente",
    date: "2026-07-04",
    dueDate: "2026-08-04",
    shipmentId: "ship-4",
    trackingNumber: "DIA-2026-004"
  }
];
