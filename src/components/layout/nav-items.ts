import {
  LayoutDashboard,
  FolderKanban,
  ArrowLeftRight,
  Users,
  User,
  type LucideIcon,
} from "lucide-react";

export const navItems: {
  href: string;
  label: string;
  icon: LucideIcon;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/parties", label: "Parties", icon: Users },
  { href: "/more", label: "Profile", icon: User },
];

export const mainRoutes = new Set(navItems.map((n) => n.href));
