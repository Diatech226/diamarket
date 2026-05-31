import {
  BadgeEuro,
  Box,
  Building2,
  CreditCard,
  FilePenLine,
  Home,
  PackageSearch,
  Route,
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
      { href: '/admin/pricing', label: 'Pricing', icon: BadgeEuro },
      { href: '/admin/expeditions', label: 'Expeditions', icon: PackageSearch },
      { href: '/admin/package-types', label: 'Package Types', icon: Box },
      { href: '/admin/addresses', label: 'Addresses / Market Points', icon: Building2 },
      { href: '/admin/tracking', label: 'Tracking', icon: Radar },
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/payments', label: 'Payments', icon: CreditCard },
      { href: '/admin/cms', label: 'CMS', icon: FilePenLine },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  },
];
