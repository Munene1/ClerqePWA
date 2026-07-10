import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BeneficiaryListPage from "./BeneficiaryListPage";
import BeneficiaryDetailPage from "./BeneficiaryDetailPage";

export default function PeoplePage({ accessToken }: { accessToken: string }) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    if (window.innerWidth >= 768) {
      setSelectedId(id);
    } else {
      navigate(`/beneficiaries/${id}`);
    }
  };

  return (
    <div className="md:grid md:h-dvh md:grid-cols-[35fr_65fr]">
      <div className="flex w-full flex-col md:h-dvh md:overflow-hidden md:border-r md:border-gray-200 md:dark:border-gray-800">
        <BeneficiaryListPage
          accessToken={accessToken}
          onSelect={handleSelect}
          selectedId={selectedId}
        />
      </div>
      <div className="max-md:hidden md:flex md:flex-col md:h-dvh md:overflow-hidden">
        {selectedId ? (
          <BeneficiaryDetailPage
            accessToken={accessToken}
            idOverride={selectedId}
            onBack={() => setSelectedId(null)}
            compact
          />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">Select a person to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
