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

const BOTTOM_NAV_HIDDEN = new Set([
  "/login",
  "/signup",
  "/projects/new",
  "/parties/new",
]);

/** Show bottom tab bar on main screens and detail pages (e.g. /projects/:id). */
export function shouldShowBottomNav(pathname: string): boolean {
  if (BOTTOM_NAV_HIDDEN.has(pathname)) return false;
  if (mainRoutes.has(pathname)) return true;
  if (/^\/projects\/[^/]+$/.test(pathname)) return true;
  if (/^\/parties\/[^/]+$/.test(pathname)) return true;
  return false;
}

/** Which tab to highlight for nested routes. */
export function getActiveNavHref(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return "/dashboard";
  if (pathname.startsWith("/projects")) return "/projects";
  if (pathname.startsWith("/transactions")) return "/transactions";
  if (pathname.startsWith("/parties")) return "/parties";
  if (pathname.startsWith("/more")) return "/more";
  return pathname;
}
