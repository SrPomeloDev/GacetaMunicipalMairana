import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Users,
  Shield,
  ClipboardList,
  Image as ImageIcon,
  UserCog,
  Settings,
  Building2,
  Tags,
  Landmark,
  Gavel,
  Mail,
  Inbox,
  CheckCircle2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const ADMIN_NAV_ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  Newspaper,
  Users,
  Shield,
  ClipboardList,
  Image: ImageIcon,
  UserCog,
  Settings,
  Building2,
  Tags,
  Landmark,
  Gavel,
  Mail,
  Inbox,
  CheckCircle2,
}

export function AdminNavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ADMIN_NAV_ICONS[name]
  if (!Icon) return null
  return <Icon className={className || "h-5 w-5"} aria-hidden />
}