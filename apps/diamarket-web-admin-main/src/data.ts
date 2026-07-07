import { Product, Order, ReturnRequest, FAQItem } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Aura X1 Pro - Smartphone 5G",
    description: "Le summum de la technologie Aura. Écran AMOLED 120Hz, triple capteur photo IA de 108 Mpx, processeur ultra-rapide de dernière génération et batterie longue durée avec charge rapide 65W. Son design épuré en verre dépoli s'associe à une ergonomie parfaite.",
    price: 899,
    originalPrice: 999,
    rating: 4.8,
    reviewsCount: 142,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=600&q=80",
    category: "Électronique",
    stock: 24,
    isElectronic: true,
    features: [
      "Écran Super AMOLED de 6,7 pouces 120Hz",
      "Processeur Aura Octa-core 4nm",
      "Triple caméra IA 108 + 48 + 12 Mpx",
      "Compatible 5G et Wi-Fi 6E",
      "Batterie de 5000 mAh avec charge rapide"
    ],
    specs: {
      "Marque": "Aura",
      "Système": "AuraOS v2 (basé sur Android)",
      "Stockage": "256 Go NVMe",
      "RAM": "12 Go LPDDR5",
      "Poids": "189g",
      "Garantie": "2 ans"
    },
    reviews: [
      { id: "rev-1-1", author: "Marc L.", rating: 5, comment: "Absolument fantastique ! L'écran est d'une fluidité incroyable et les photos de nuit sont spectaculaires.", date: "2026-06-20" },
      { id: "rev-1-2", author: "Sophie T.", rating: 4, comment: "Très bon téléphone, puissant et beau. La charge est ultra rapide, mais l'appareil chauffe un peu en jeu.", date: "2026-06-25" },
      { id: "rev-1-3", author: "Nicolas V.", rating: 5, comment: "Un chef-d'œuvre de technologie. L'autonomie tient facilement deux jours complets.", date: "2026-07-01" }
    ]
  },
  {
    id: "prod-2",
    name: "Aura Sound Pro - Casque ANC",
    description: "Plongez dans un silence absolu avec la réduction active du bruit hybride de pointe d'Aura. Offre un son haute résolution spatialisé, des coussinets à mémoire de forme en cuir végétal ultra-confortables et une autonomie exceptionnelle de 45 heures.",
    price: 249,
    originalPrice: 299,
    rating: 4.7,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    category: "Électronique",
    stock: 45,
    isElectronic: true,
    features: [
      "Réduction active de bruit (ANC) hybride adaptative",
      "Audio spatial 3D avec suivi dynamique des mouvements",
      "Autonomie jusqu'à 45h (ANC activé)",
      "Connexion multipoint Bluetooth 5.2",
      "Microphones de qualité studio pour appels limpides"
    ],
    specs: {
      "Marque": "Aura",
      "Autonomie": "45 heures",
      "Temps de charge": "1.5 heures",
      "Connexions": "Bluetooth 5.2 & Jack 3.5mm",
      "Poids": "250g",
      "Codec": "LDAC, AAC, SBC"
    },
    reviews: [
      { id: "rev-2-1", author: "Julien M.", rating: 5, comment: "Le son est tout simplement bluffant de clarté. L'annulation du bruit est au niveau des meilleurs du marché.", date: "2026-06-18" },
      { id: "rev-2-2", author: "Aline R.", rating: 4, comment: "Très confortable pour de longues sessions de travail. Super autonomie de batterie !", date: "2026-06-22" }
    ]
  },
  {
    id: "prod-3",
    name: "Aura Watch Pulse - Montre Connectée",
    description: "Prenez soin de votre santé avec élégance. Suivi ECG en temps réel, mesure de l'oxygénation sanguine, analyse avancée du sommeil et plus de 80 modes sportifs intégrés. Son écran tactile AMOLED est entouré d'un boîtier robuste en aluminium brossé.",
    price: 199,
    originalPrice: 229,
    rating: 4.5,
    reviewsCount: 67,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
    category: "Électronique",
    stock: 15,
    isElectronic: true,
    features: [
      "Écran tactile AMOLED circulaire 1,4 pouce",
      "Suivi ECG, fréquence cardiaque et SpO2 continu",
      "GPS multisatellite de haute précision intégré",
      "Résistant à l'eau jusqu'à 50 mètres (5 ATM)",
      "Autonomie longue durée de 10 jours en usage normal"
    ],
    specs: {
      "Marque": "Aura",
      "Compatibilité": "iOS & Android",
      "Écran": "AMOLED 454x454 px",
      "Matière": "Aluminium et bracelet silicone",
      "GPS": "GPS / GLONASS / Galileo",
      "Autonomie": "Jusqu'à 10 jours"
    },
    reviews: [
      { id: "rev-3-1", author: "David K.", rating: 4, comment: "Une montre élégante qui suit parfaitement mon activité sportive et mon sommeil.", date: "2026-06-12" },
      { id: "rev-3-2", author: "Chloé G.", rating: 5, comment: "Superbe écran bien lumineux même en plein soleil. Les fonctions de santé sont précises.", date: "2026-06-30" }
    ]
  },
  {
    id: "prod-4",
    name: "Machine Espresso Café d'Or",
    description: "L'art de l'espresso italien à la maison. Cette machine élégante allie un système de chauffe Thermoblock ultra-rapide à une pompe de 19 bars pour extraire des arômes d'une richesse incomparable. Buse vapeur professionnelle pour des cappuccinos onctueux.",
    price: 349,
    originalPrice: 399,
    rating: 4.6,
    reviewsCount: 112,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80",
    category: "Maison & Déco",
    stock: 8,
    isElectronic: false,
    features: [
      "Pression de pompe professionnelle de 19 bars",
      "Chauffage Thermoblock rapide (prêt en 35 secondes)",
      "Buse vapeur articulée en inox pour micro-mousse de lait",
      "Porte-filtre double embout robuste et dosette ESE",
      "Réservoir d'eau amovible de 1,2 litre"
    ],
    specs: {
      "Marque": "Café d'Or",
      "Puissance": "1350 W",
      "Matériau": "Acier inoxydable",
      "Dimensions": "15 x 33 x 30 cm",
      "Réservoir": "1.2 L",
      "Pression": "19 Bars"
    },
    reviews: [
      { id: "rev-4-1", author: "Damien F.", rating: 5, comment: "Un espresso digne des meilleurs salons de café ! Facile d'utilisation et d'entretien.", date: "2026-06-15" },
      { id: "rev-4-2", author: "Céline B.", rating: 4, comment: "Très bon café bien crémeux. La buse vapeur fonctionne à merveille pour mes lattes.", date: "2026-06-29" }
    ]
  },
  {
    id: "prod-5",
    name: "Écharpe en Soie de Lyon 'L'Élégance'",
    description: "Une écharpe d'exception fabriquée à la main dans les célèbres ateliers lyonnais. Réalisée en pure soie de mûrier d'une douceur incomparable, elle présente un motif abstrait contemporain aux teintes chaudes et raffinées.",
    price: 120,
    originalPrice: 150,
    rating: 4.9,
    reviewsCount: 34,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
    category: "Mode",
    stock: 12,
    isElectronic: false,
    features: [
      "100% soie de mûrier de qualité supérieure",
      "Imprimé de manière artisanale",
      "Dimensions généreuses : 180 x 90 cm",
      "Ourlets roulottés à la main",
      "Légèreté et fluidité parfaites en toute saison"
    ],
    specs: {
      "Origine": "Lyon, France",
      "Matière": "100% Soie de Mûrier",
      "Entretien": "Nettoyage à sec recommandé",
      "Dimensions": "180 x 90 cm",
      "Style": "Contemporain"
    },
    reviews: [
      { id: "rev-5-1", author: "Elisabeth D.", rating: 5, comment: "Une merveille de douceur. Les couleurs sont chatoyantes et la soie est d'une finesse incomparable.", date: "2026-06-10" }
    ]
  },
  {
    id: "prod-6",
    name: "Portefeuille en Cuir 'Le Sellier'",
    description: "Portefeuille intemporel en cuir de vachette pleine fleur tanné végétalement. Cousu au point de sellier pour une durabilité extrême, il se patinera magnifiquement avec le temps. Équipé d'une protection RFID intégrée.",
    price: 79,
    originalPrice: 89,
    rating: 4.4,
    reviewsCount: 56,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    category: "Mode",
    stock: 28,
    isElectronic: false,
    features: [
      "Cuir de vachette pleine fleur véritable",
      "Tannage végétal écoresponsable",
      "Protection contre le piratage bancaire (RFID)",
      "Compartiments pour 8 cartes, billets et monnaie",
      "Format compact adapté aux poches"
    ],
    specs: {
      "Marque": "Le Sellier",
      "Matière": "Cuir de vachette pleine fleur",
      "Dimensions": "11 x 9 x 1.5 cm",
      "Poches": "8 emplacements cartes, 1 porte-monnaie",
      "Sécurité": "Blindage RFID"
    },
    reviews: [
      { id: "rev-6-1", author: "Gérard P.", rating: 4, comment: "Le cuir sent bon et les coutures sont impeccables. Il est compact mais spacieux.", date: "2026-06-21" },
      { id: "rev-6-2", author: "Antoine S.", rating: 5, comment: "La qualité du cuir est exceptionnelle. La protection RFID me rassure au quotidien.", date: "2026-07-03" }
    ]
  },
  {
    id: "prod-7",
    name: "Coussin en Velours 'Chic Cocoon'",
    description: "Apportez une touche de douceur et d'opulence à votre canapé ou votre lit. Housse en velours de coton dense et ultra-moelleuse avec garnissage généreux en fibres recyclées haute résilience. Fermeture éclair invisible.",
    price: 45,
    originalPrice: 49,
    rating: 4.3,
    reviewsCount: 22,
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
    category: "Maison & Déco",
    stock: 50,
    isElectronic: false,
    features: [
      "Velours de coton haut de gamme, toucher soyeux",
      "Garnissage hypoallergénique inclus",
      "Fermeture à glissière invisible pour déhoussage facile",
      "Disponible en plusieurs coloris tendances",
      "Fabrication respectueuse des normes Oeko-Tex"
    ],
    specs: {
      "Marque": "Chic Cocoon",
      "Dimensions": "45 x 45 cm",
      "Housse": "100% Velours de coton",
      "Garnissage": "Polyester 100% recyclé",
      "Lavage": "Housse lavable en machine à 30°C"
    },
    reviews: [
      { id: "rev-7-1", author: "Mathilde J.", rating: 4, comment: "Doux et confortable. Donne un vrai style chaleureux à mon fauteuil de lecture.", date: "2026-06-17" }
    ]
  },
  {
    id: "prod-8",
    name: "Bougie Parfumée Bio 'Sérénité'",
    description: "Éveillez vos sens et créez une atmosphère apaisante. Bougie coulée à la main à base de cire de soja 100% naturelle et biodégradable. Parfum subtil de lavande de Provence, de sauge blanche et de bois de santal.",
    price: 32,
    rating: 4.8,
    reviewsCount: 45,
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80",
    category: "Bien-être & Beauté",
    stock: 60,
    isElectronic: false,
    features: [
      "Cire de soja bio sans OGM ni pesticides",
      "Parfums de Grasse de haute qualité",
      "Mèche en bois de cerisier crépitante",
      "Durée de combustion d'environ 50 heures",
      "Pot en céramique réutilisable après lavage"
    ],
    specs: {
      "Marque": "Sérénité",
      "Poids": "220g",
      "Temps de brûle": "50 heures",
      "Mèche": "Bois naturel",
      "Ingrédients": "Cire de Soja & Huiles Essentielles"
    },
    reviews: [
      { id: "rev-8-1", author: "Sandrine F.", rating: 5, comment: "L'odeur de lavande est subtile et ne prend pas la tête. La mèche en bois crépite doucement, j'adore !", date: "2026-06-24" }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "CMD-2026-9041",
    customerName: "Camille Dubois",
    email: "camille.dubois@gmail.com",
    phone: "06 12 34 56 78",
    date: "2026-07-02",
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1, price: 899 },
      { product: INITIAL_PRODUCTS[5], quantity: 1, price: 79 }
    ],
    subtotal: 978,
    shippingCost: 0,
    taxCost: 195.6,
    total: 978,
    status: "Expédié",
    deliveryAddress: {
      fullName: "Camille Dubois",
      street: "18 Rue de la Paix",
      city: "Paris",
      postalCode: "75002",
      country: "France"
    },
    shippingMethod: "Aura Express (Gratuit)",
    paymentMethod: "Carte Bancaire (VISA закінчується на 4242)",
    estimatedDelivery: "2026-07-07"
  },
  {
    id: "CMD-2026-8735",
    customerName: "Jean-Pierre Martin",
    email: "jp.martin@yahoo.fr",
    phone: "07 98 76 54 32",
    date: "2026-07-04",
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 2, price: 249 }
    ],
    subtotal: 498,
    shippingCost: 9.9,
    taxCost: 99.6,
    total: 507.9,
    status: "Préparé",
    deliveryAddress: {
      fullName: "Jean-Pierre Martin",
      street: "45 Avenue des Vosges",
      city: "Strasbourg",
      postalCode: "67000",
      country: "France"
    },
    shippingMethod: "Colissimo standard",
    paymentMethod: "PayPal",
    estimatedDelivery: "2026-07-10"
  },
  {
    id: "CMD-2026-4192",
    customerName: "Amandine Leroy",
    email: "amandine.leroy@outlook.com",
    phone: "06 87 65 43 21",
    date: "2026-07-05",
    items: [
      { product: INITIAL_PRODUCTS[3], quantity: 1, price: 349 },
      { product: INITIAL_PRODUCTS[6], quantity: 2, price: 45 },
      { product: INITIAL_PRODUCTS[7], quantity: 1, price: 32 }
    ],
    subtotal: 471,
    shippingCost: 15,
    taxCost: 94.2,
    total: 486,
    status: "En attente",
    deliveryAddress: {
      fullName: "Amandine Leroy",
      street: "8 Place de la Comédie",
      city: "Montpellier",
      postalCode: "34000",
      country: "France"
    },
    shippingMethod: "Livraison à Domicile Premium",
    paymentMethod: "Apple Pay",
    estimatedDelivery: "2026-07-12"
  },
  {
    id: "CMD-2026-3011",
    customerName: "Thomas Roche",
    email: "thomas.roche@orange.fr",
    phone: "06 55 44 33 22",
    date: "2026-06-28",
    items: [
      { product: INITIAL_PRODUCTS[2], quantity: 1, price: 199 }
    ],
    subtotal: 199,
    shippingCost: 0,
    taxCost: 39.8,
    total: 199,
    status: "Livré",
    deliveryAddress: {
      fullName: "Thomas Roche",
      street: "12 Rue de la République",
      city: "Lyon",
      postalCode: "69002",
      country: "France"
    },
    shippingMethod: "Aura Express (Gratuit)",
    paymentMethod: "Carte Bancaire",
    estimatedDelivery: "2026-07-02"
  }
];

export const INITIAL_RETURNS: ReturnRequest[] = [
  {
    id: "RET-9821",
    orderId: "CMD-2026-3011",
    customerName: "Thomas Roche",
    email: "thomas.roche@orange.fr",
    date: "2026-07-03",
    product: INITIAL_PRODUCTS[2],
    quantity: 1,
    reason: "Produit défectueux",
    description: "La montre connectée ne se charge pas correctement. Lorsque je la pose sur son socle, l'indicateur clignote rouge et s'éteint au bout de 5 secondes. J'ai essayé avec un autre adaptateur secteur mais le problème persiste.",
    status: "En attente",
    refundAmount: 199,
    images: ["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: "RET-7412",
    orderId: "CMD-2026-1025",
    customerName: "Isabelle Gauthier",
    email: "isabelle.g@gmail.com",
    date: "2026-06-25",
    product: INITIAL_PRODUCTS[6],
    quantity: 1,
    reason: "Ne correspond pas à la description",
    description: "Le coussin est de bonne qualité mais la teinte de velours est beaucoup plus foncée que sur les photos de la boutique. Elle ne s'accorde pas avec la décoration de mon salon.",
    status: "Approuvé",
    refundAmount: 45,
    sellerComment: "Retour accepté. Le remboursement sera crédité sur votre carte bancaire sous 5 jours ouvrés après réception de l'article."
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "Comment puis-je modifier ou annuler une commande ?",
    answer: "Tant que votre commande n'est pas encore en statut 'Préparé' ou 'Expédié', vous pouvez la modifier ou l'annuler directement depuis votre profil d'utilisateur. Passé ce délai, veuillez contacter immédiatement notre support client.",
    category: "Commandes"
  },
  {
    id: "faq-2",
    question: "Quels sont vos délais et frais de livraison ?",
    answer: "Nous offrons la livraison Aura Express gratuite à partir de 150 € d'achat (livraison en 2 à 4 jours ouvrés). Pour les commandes inférieures, la livraison standard Colissimo coûte entre 4,90 € et 9,90 € selon le poids de l'article.",
    category: "Livraison"
  },
  {
    id: "faq-3",
    question: "Quelle est votre politique de retour ?",
    answer: "Vous disposez d'un délai de 14 jours après réception de votre commande pour demander un retour. Les articles doivent être retournés neufs, non utilisés, dans leur emballage d'origine. Les frais de retour sont entièrement pris en charge par AuraMarket en cas de produit défectueux.",
    category: "Retours"
  },
  {
    id: "faq-4",
    question: "Comment fonctionne la garantie pour les produits électroniques ?",
    answer: "Tous nos appareils électroniques Aura bénéficient d'une garantie constructeur de 2 ans. Elle couvre les pannes matérielles dans des conditions d'utilisation normales. Le retour et la réparation ou le remplacement de l'appareil sont intégralement pris en charge.",
    category: "Général"
  },
  {
    id: "faq-5",
    question: "Quels modes de paiement acceptez-vous ?",
    answer: "Nous acceptons les cartes bancaires (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay ainsi que les paiements sécurisés en 3 ou 4 fois avec notre partenaire Alma pour les commandes supérieures à 100 €.",
    category: "Paiements"
  }
];
