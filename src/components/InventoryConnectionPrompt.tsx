import { useEffect, useState } from "react";
import {
  connectInventoryBusiness,
  discoverInventoryConnection,
  type InventoryBusiness,
  type InventoryConnectionState,
} from "../api/inventory";


export default function InventoryConnectionPrompt({ accessToken }: { accessToken: string }) {
  const [state, setState] = useState<InventoryConnectionState | null>(null);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setState(null);
    setDismissed(false);
    setError(null);
    if (!accessToken) return () => { active = false; };
    void discoverInventoryConnection(accessToken)
      .then((result) => {
        if (!active) return;
        setState(result);
        const options = resolveBusinesses(result);
        if (options.length === 1) {
          setSelectedShopId(options[0].shop_id);
        }
      })
      .catch(() => {
        if (active) setState({ status: "not_checked" });
      });
    return () => { active = false; };
  }, [accessToken]);

  if (!state || dismissed || ["not_checked", "no_match"].includes(state.status)) return null;
  if (state.status === "connected") {
    return (
      <aside className="fixed right-3 top-3 z-50 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm shadow-lg backdrop-blur dark:border-emerald-900 dark:bg-[#111]/95" aria-live="polite">
        <div className="font-semibold text-gray-900 dark:text-white">Inventory connected</div>
        <div className="mt-0.5 text-gray-600 dark:text-gray-300">Products and sales from {state.business?.name || "your business"} are ready.</div>
        <button className="mt-2 text-xs font-medium text-[var(--brand-primary)]" onClick={() => setDismissed(true)}>Dismiss</button>
      </aside>
    );
  }

  const businesses = resolveBusinesses(state);
  return (
    <aside className="fixed right-3 top-3 z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-black/10 bg-white/95 p-4 text-sm shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#111]/95" aria-label="Inventory connection available">
      <div className="font-semibold text-gray-900 dark:text-white">Inventory found</div>
      <p className="mt-1 text-gray-600 dark:text-gray-300">
        {businesses.length === 1
          ? `${businesses[0].name} is linked to the email you use with Clerqe.`
          : `We found ${businesses.length} businesses linked to your email.`}
      </p>
      {businesses.length > 1 && (
        <div className="mt-3 space-y-2">
          {businesses.map((business) => (
            <label key={business.shop_id} className="flex cursor-pointer gap-2 rounded-xl border border-black/8 p-2 dark:border-white/10">
              <input type="radio" name="inventory-business" value={business.shop_id} checked={selectedShopId === business.shop_id} onChange={() => setSelectedShopId(business.shop_id)} />
              <span><strong>{business.name}</strong>{business.location ? ` - ${business.location}` : ""}</span>
            </label>
          ))}
        </div>
      )}
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-300">{error}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="rounded-full px-3 py-2 text-gray-600 dark:text-gray-300" onClick={() => setDismissed(true)}>Not now</button>
        <button
          type="button"
          disabled={!selectedShopId || connecting}
          className="rounded-full bg-[var(--brand-primary)] px-4 py-2 font-semibold text-white disabled:opacity-50"
          onClick={async () => {
            setConnecting(true);
            setError(null);
            try {
              setState(await connectInventoryBusiness(accessToken, selectedShopId));
            } catch (nextError) {
              setError(nextError instanceof Error ? nextError.message : "Could not connect Inventory.");
            } finally {
              setConnecting(false);
            }
          }}
        >
          {connecting ? "Connecting..." : "Connect"}
        </button>
      </div>
    </aside>
  );
}

function resolveBusinesses(state: InventoryConnectionState): InventoryBusiness[] {
  if (state.businesses?.length) return state.businesses;
  if (state.business && "shop_id" in state.business) return [state.business as InventoryBusiness];
  return [];
}
