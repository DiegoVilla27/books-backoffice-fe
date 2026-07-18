import { ROUTES_MAPPING } from "@core/interfaces/routes-mapping";

/**
 * Interface representing a structural navigation link element.
 */
export interface NavItem {
  /** The display label text for the menu link item. */
  label: string;
  /** Relative route path link. */
  route: string;
  /** Graphic icon descriptor label matching the design token icon. */
  icon: string;
}

/**
 * Standard configuration list of sidebar menu links displayed in the application layout.
 */
export const menuItems: NavItem[] = [
  { label: 'Dashboard', route: ROUTES_MAPPING.admin.dashboard, icon: 'dashboard' },
  { label: 'Users', route: ROUTES_MAPPING.admin.users.root, icon: 'users' },
  { label: 'Books', route: ROUTES_MAPPING.admin.books.root, icon: 'books' },
  { label: 'Logs', route: ROUTES_MAPPING.admin.logs.root, icon: 'logs' },
];