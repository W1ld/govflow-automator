import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Wallet,
  LogOut,
  Calculator,
  Users,
  Archive,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: PlusCircle, label: "Input Kegiatan", path: "/kegiatan/baru" },
  { icon: FileText, label: "Daftar SPJ", path: "/spj" },
  { icon: Wallet, label: "Anggaran", path: "/anggaran" },
  { icon: Calculator, label: "Kalkulator Pajak", path: "/pajak" },
  { icon: Users, label: "Vendor", path: "/vendor" },
  { icon: Archive, label: "Arsip Dokumen", path: "/arsip" },
  { icon: Settings, label: "Pengaturan", path: "/pengaturan" },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-sidebar-primary">
          <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-slide-in-left">
            <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-wide">
              W-GovSPJ
            </h1>
            <p className="text-[10px] text-sidebar-muted leading-none">
              Government Accountability
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && (
                <span className="animate-slide-in-left">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-sidebar-border px-2 py-2">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-1 rounded-md bg-sidebar-accent/40">
            <p className="text-[10px] text-sidebar-muted uppercase tracking-wider mb-0.5">Masuk sebagai</p>
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium w-full text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors",
          )}
          title={collapsed ? "Keluar" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
