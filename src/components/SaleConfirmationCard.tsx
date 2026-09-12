import { useMemo, useState } from "react";

import type { SaleCardState } from "../types/chat";

type SaleClarificationMatch = NonNullable<SaleCardState["clarifications"]>[number]["matches"][number];

export default function SaleConfirmationCard(props: {
  card: SaleCardState;
  onConfirm: (actionRequestId: string, items: Array<{ product_unit_id: string; quantity: number }>, correlationId: string) => void;
  onCancel: (actionRequestId: string) => void;
  onSelectClarification: (match: SaleClarificationMatch, correlationId: string) => void;
}) {
  const [items, setItems] = useState(props.card.items);
  const locked = ["processing", "completed", "failed", "cancelled"].includes(props.card.status);
  const currency = props.card.currency || "KES";
  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.unit_price) || 0;
        return sum + quantity * price;
      }, 0),
    [items],
  );

  if (props.card.status === "clarification") {
    return (
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-4 shadow-lg dark:border-amber-900/50 dark:bg-[#101312]">
        <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Choose the right product</div>
        <div className="space-y-3">
          {(props.card.clarifications || []).map((clarification) => (
            <div key={clarification.requested_item} className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-950/20">
              <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">{clarification.requested_item}</div>
              <div className="space-y-2">
                {clarification.matches.map((match) => (
                  <button
                    key={match.product_unit_id}
                    type="button"
                    onClick={() => props.onSelectClarification(match, props.card.correlationId)}
                    className="block w-full rounded-xl border border-black/10 bg-white p-2 text-left text-sm transition hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/30 dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/10"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{match.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {match.sku} · {currency} {match.price} · stock {match.available_stock ?? "0"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Tap the matching product to continue.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-3xl border border-black/10 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-[#101312]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {props.card.status === "completed" ? "Sale completed" : props.card.status === "failed" ? "Sale failed" : "Sale ready"}
          </div>
          {props.card.message && <div className="text-xs text-gray-500 dark:text-gray-400">{props.card.message}</div>}
        </div>
        <div className="rounded-full bg-[var(--brand-primary)]/10 px-3 py-1 text-sm font-semibold text-[var(--brand-primary)]">
          {currency} {total.toLocaleString()}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-black/8 dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <tr>
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.product_unit_id} className="border-t border-black/6 dark:border-white/8">
                <td className="px-3 py-2">
                  <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</div>
                </td>
                <td className="px-3 py-2">
                  <input
                    disabled={locked}
                    value={item.quantity}
                    type="number"
                    min="0"
                    step="1"
                    onChange={(event) =>
                      setItems((current) =>
                        current.map((row) =>
                          row.product_unit_id === item.product_unit_id ? { ...row, quantity: event.target.value } : row,
                        ),
                      )
                    }
                    className="w-16 rounded-lg border border-black/10 bg-transparent px-2 py-1 dark:border-white/10"
                  />
                </td>
                <td className="px-3 py-2">{currency} {Number(item.unit_price || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {props.card.status === "completed" && (
        <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          Sale {props.card.saleId} completed. Receipt {props.card.receiptNumber || "pending"}.
        </div>
      )}

      {props.card.status === "failed" && (
        <div className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200">
          {props.card.message || "The sale could not be completed."}
        </div>
      )}

      {props.card.status === "prepared" && (
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => props.onCancel(props.card.actionRequestId)} className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10">
            Cancel
          </button>
          <button
            onClick={() =>
              props.onConfirm(
                props.card.actionRequestId,
                items
                  .map((item) => ({ product_unit_id: item.product_unit_id, quantity: Number(item.quantity) || 0 }))
                  .filter((item) => item.quantity > 0),
                props.card.correlationId,
              )
            }
            className="rounded-full bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-primary-hover)]"
          >
            Confirm Sale
          </button>
        </div>
      )}
    </div>
  );
}
