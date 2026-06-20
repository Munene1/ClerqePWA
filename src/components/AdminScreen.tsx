import { useState } from "react";
import AdminLayout, { type AdminTab } from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminCustomers from "./AdminCustomers";
import AdminCustomerDetail from "./AdminCustomerDetail";
import AdminSessions from "./AdminSessions";
import AdminEvents from "./AdminEvents";
import AdminAudit from "./AdminAudit";

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomer(id);
    setActiveTab("customers");
  };

  const handleBackFromCustomer = () => {
    setSelectedCustomer(null);
  };

  const renderContent = () => {
    if (activeTab === "customers" && selectedCustomer) {
      return <AdminCustomerDetail customerId={selectedCustomer} onBack={handleBackFromCustomer} />;
    }

    switch (activeTab) {
      case "overview":
        return <AdminDashboard />;
      case "customers":
        return <AdminCustomers onSelectCustomer={handleSelectCustomer} />;
      case "sessions":
        return <AdminSessions />;
      case "events":
        return <AdminEvents />;
      case "audit":
        return <AdminAudit />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== "customers") setSelectedCustomer(null);
      }}
    >
      {renderContent()}
    </AdminLayout>
  );
}
