"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard, Users, Layers, Monitor, Activity, FileText, Shield, Settings,
  LogOut, Menu, X, ChevronDown, ChevronRight, Bell, Search, User,
  Sparkles, Moon, Sun, Monitor as MonitorIcon, LogOutIcon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { authFetch, clearAuthToken } from "@/lib/client-auth";

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
  superOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Students",
    icon: Users,
    children: [
      { label: "All Students", href: "/students" },
      { label: "Add Student", href: "/students/new" },
      { label: "Import Students", href: "/students/import" },
      { label: "Statistics", href: "/students/stats" },
    ],
  },
  {
    label: "Batches",
    icon: Layers,
    children: [
      { label: "All Batches", href: "/batches" },
      { label: "Create Batch", href: "/batches/new" },
      { label: "Statistics", href: "/batches/stats" },
    ],
  },
  {
    label: "Lab Sessions",
    icon: Monitor,
    children: [
      { label: "Start New Session", href: "/sessions/start" },
      { label: "Live Sessions", href: "/sessions/live" },
      { label: "Computers", href: "/computers" },
      { label: "Session History", href: "/sessions/history" },
      { label: "Action History", href: "/sessions/actions" },
    ],
  },
  {
    label: "Reports",
    icon: FileText,
    children: [
      { label: "All Reports", href: "/reports" },
      { label: "Student Reports", href: "/reports/students" },
      { label: "Batch Reports", href: "/reports/batches" },
      { label: "Session Reports", href: "/reports/sessions" },
      { label: "Computer Reports", href: "/reports/computers" },
      { label: "Daily Reports", href: "/reports/daily" },
      { label: "Monthly Reports", href: "/reports/monthly" },
      { label: "Action History Report", href: "/reports/action-history" },
    ],
  },
  {
    label: "Administration",
    icon: Shield,
    children: [
      { label: "Admin Profile", href: "/profile" },
      { label: "Admin Management", href: "/admins", },
      { label: "Audit Logs", href: "/audit" },
    ],
  },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const profileRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    authFetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.admin) {
          window.location.href = "/";
        } else {
          setAdmin(data.admin);
        }
      })
      .catch(() => {
        window.location.href = "/";
      })
      .finally(() => setAuthChecking(false));
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSuperAdmin = admin?.role === "super_admin";

  const filteredMenu = menuItems.map((item) => {
    if (item.children) {
      const filtered = item.children.filter((c) => {
        if (c.href === "/admins" && !isSuperAdmin) return false;
        return true;
      });
      return { ...item, children: filtered };
    }
    return item;
  });

  async function handleLogout() {
    await authFetch("/api/auth/logout", { method: "POST" });
    clearAuthToken();
    window.location.href = "/";
  }

  const greeting = (() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  })();

  const initials = admin?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "A";

  if (authChecking || !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-[var(--text-muted)]">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[var(--bg-secondary)] border-r border-[var(--border)] z-50 transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 p-6 border-b border-[var(--border)]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[var(--text-primary)] truncate">Lab History</h2>
            <p className="text-xs text-[var(--text-muted)]">Management System</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedItems.includes(item.label);
            const isActive =
              item.href === pathname ||
              item.children?.some((c) => pathname.startsWith(c.href));

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-600 dark:text-indigo-400"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            }

            return (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setExpandedItems((prev) =>
                      prev.includes(item.label)
                        ? prev.filter((i) => i !== item.label)
                        : [...prev, item.label]
                    )
                  }
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-8 mt-1 space-y-0.5 border-l border-[var(--border)] pl-4">
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block px-3 py-2 rounded-md text-sm transition-all ${
                              pathname === child.href
                                ? "text-indigo-600 dark:text-indigo-400 font-medium"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3 p-2 rounded-lg">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              style={{ backgroundColor: admin.avatarColor }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {admin.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate capitalize">
                {admin.role.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border)]">
          <div className="flex items-center gap-4 px-4 lg:px-8 py-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1">
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                {greeting}, {admin.name.split(" ")[0]} 👋
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                • {currentTime.toLocaleTimeString("en-US")}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] w-80">
              <Search className="w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, batches, sessions..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
              />
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-xs bg-[var(--bg-tertiary)] rounded text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </div>

            <button
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <button className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Profile menu */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                  style={{ backgroundColor: admin.avatarColor }}
                >
                  {initials}
                </div>
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-60 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-4 border-b border-[var(--border)]">
                      <p className="font-medium text-[var(--text-primary)]">{admin.name}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{admin.email}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full capitalize">
                        {admin.role.replace("_", " ")}
                      </span>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
