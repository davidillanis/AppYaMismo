// src/presentation/components/DrawerMenu.tsx
import { Colors } from '@/constants/Colors';
interface MenuItem {
  icon: string;
  title: string;
  route: string;
}

export interface DrawerMenuProps {
  colors: typeof Colors.light;
  user: { name: string; email: string, accessToken: string } | null;
  screenWidth: number;
  authority: string;
  menuItems: MenuItem[];
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

// src/presentation/components/Header.tsx
export interface HeaderProps {
  colors: typeof Colors.light;
  screenWidth: number;
  onMenuPress: () => void;
  onProfilePress?: () => void;
  title?: string;
  subTitle?: string;
}

// src/presentation/components/ProfileCard.tsx
export interface ProfileCardProps {
  colors: typeof Colors.light;
  user: { name: string; email: string, accessToken: string } | null;
  screenWidth: number;
  authority: string;
  onEditPress: () => void;
}

// src/presentation/components/ServiceCard.tsx
interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  route: string;
  color: string;
}

export interface ServiceCardProps {
  colors: typeof Colors.light;
  screenWidth: number;
  serviceCards: ServiceItem[];
  onNavigate: (route: string) => void;
}

export interface CarCardProps {
  colors: typeof Colors.light;
  screenWidth: number;
}
