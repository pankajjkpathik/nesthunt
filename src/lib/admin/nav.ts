import {
  LayoutDashboard,
  MapPin,
  Building2,
  Boxes,
  Tags,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Star,
  Users,
  Activity,
  Settings,
  Search,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  /** Route not yet implemented — render as disabled. */
  disabled?: boolean;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    label: "Property",
    items: [
      { to: "/admin/places", label: "Places", icon: MapPin },
      { to: "/admin/builders", label: "Builders", icon: Building2, disabled: true },
      { to: "/admin/projects", label: "Projects", icon: Boxes, disabled: true },
      { to: "/admin/categories", label: "Categories", icon: Tags, disabled: true },
      { to: "/admin/amenities", label: "Amenities", icon: Sparkles, disabled: true },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/blog", label: "Blog", icon: FileText, disabled: true },
      { to: "/admin/media", label: "Media Library", icon: ImageIcon, disabled: true },
      { to: "/admin/reviews", label: "Reviews", icon: Star, disabled: true },
    ],
  },
  {
    label: "Management",
    items: [
      { to: "/admin/users", label: "Users", icon: Users, disabled: true },
      { to: "/admin/activity", label: "Activity Logs", icon: Activity, disabled: true },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings, disabled: true },
      { to: "/admin/seo", label: "SEO", icon: Search, disabled: true },
    ],
  },
];
