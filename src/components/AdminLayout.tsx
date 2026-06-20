import { useState, type ReactNode } from "react";
import { adminLogout } from "../api/admin";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "LayoutDashboard" },
  { id: "customers", label: "Customers", icon: "Users" },
  { id: "sessions", label: "Sessions", icon: "Radio" },
  { id: "health", label: "Health", icon: "Activity" },
  { id: "events", label: "Events", icon: "List" },
  { id: "audit", label: "Audit Logs", icon: "FileText" },
] as const;

export type AdminTab = (typeof NAV_ITEMS)[number]["id"];

function NavIcon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    LayoutDashboard: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
    Users: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    Radio: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" /><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" /><circle cx="12" cy="12" r="2" /><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" /><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19" />
      </svg>
    ),
    Activity: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
      </svg>
    ),
    List: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
      </svg>
    ),
    FileText: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function AdminLayout(props: {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  children: ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} dark:bg-gray-900 dark:border-gray-800`}>
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center gap-2.5 border-b border-gray-200 px-5 dark:border-gray-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-primary)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Clerqe Admin</span>
          </div>

          <nav className="flex-1 space-y-0.5 px-3 py-3">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { props.onTabChange(item.id); setSidebarOpen(false); }}
                className={`flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-sm font-medium transition-colors ${
                  props.activeTab === item.id
                    ? "bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-gray-200 px-3 py-3 dark:border-gray-800">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-[3px] px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:hidden dark:bg-gray-900 dark:border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-400">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Clerqe Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {props.children}
        </main>
      </div>
    </div>
  );
}
