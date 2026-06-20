import {
  AlertTriangle,
  BadgeEuro,
  BarChart3,
  Box,
  Building2,
  CreditCard,
  FilePenLine,
  Home,
  PackageSearch,
  Route,
  Search,
  Settings,
  Radar,
  Users,
} from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

export type NavGroup = {
  label: string;
  links: NavLink[];
  devOnly?: boolean;
};

export const navGroups: NavGroup[] = [
  {
    label: 'Operations',
    links: [
      { href: '/admin', label: 'Dashboard', icon: Home },
      { href: '/admin/quotes', label: 'Quotes', icon: PackageSearch },
      { href: '/admin/shipments', label: 'Shipments', icon: Route },
      { href: '/admin/operations', label: 'Operations Center', icon: Route },
      { href: '/admin/operations/incidents', label: 'Incidents', icon: AlertTriangle },
      { href: '/admin/operations/board', label: 'Operations Board', icon: BarChart3 },
      { href: '/admin/operations/sla', label: 'SLA', icon: Radar },
      { href: '/admin/hubs', label: 'Hubs', icon: Building2 },
      { href: '/admin/alerts', label: 'Alerts', icon: AlertTriangle },
      { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { href: '/admin/search', label: 'Global Search', icon: Search },
      { href: '/admin/pricing', label: 'Pricing', icon: BadgeEuro },
      { href: '/admin/expeditions', label: 'Expeditions', icon: PackageSearch },
      { href: '/admin/package-types', label: 'Package Types', icon: Box },
      { href: '/admin/addresses', label: 'Addresses / Market Points', icon: Building2 },
      { href: '/admin/tracking', label: 'Tracking', icon: Radar },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/payments', label: 'Payments', icon: CreditCard },
      { href: '/admin/cms', label: 'CMS', icon: FilePenLine },
      { href: '/admin/services', label: 'Services CMS', icon: Box },
      { href: '/admin/popular-routes', label: 'Popular Routes', icon: Route },
      { href: '/admin/faq', label: 'FAQ', icon: FilePenLine },
      { href: '/admin/testimonials', label: 'Testimonials', icon: FilePenLine },
      { href: '/admin/case-studies', label: 'Case Studies', icon: FilePenLine },
      { href: '/admin/newsletter', label: 'Newsletter', icon: FilePenLine },
      { href: '/admin/marketing', label: 'Marketing', icon: FilePenLine },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  },
];
