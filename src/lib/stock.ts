import type { StockMovement } from "./domain";

export type ValuationMethod = "fifo" | "weighted";

export interface StockValuation {
  quantity: number;
  valueMinor: number;
  averageCostMinor: number;
  costOfGoodsSoldMinor: number;
  unfulfilledOutQuantity: number;
}

export function valueStock(
  movements: StockMovement[],
  method: ValuationMethod = "weighted",
): StockValuation {
  const ordered = [...movements].sort((a, b) => {
    const byDate = String(a.date ?? "").localeCompare(String(b.date ?? ""));
    const byCreated = String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? ""));
    return byDate || byCreated || String(a.id ?? "").localeCompare(String(b.id ?? ""));
  });

  let quantity = 0;
  let valueMinor = 0;
  let costOfGoodsSoldMinor = 0;
  let unfulfilledOutQuantity = 0;
  const lots: Array<{ quantity: number; unitCostMinor: number }> = [];

  for (const movement of ordered) {
    const qty = Math.max(0, Math.floor(movement.quantity));
    const cost = Math.max(0, Math.round(movement.unitCostMinor));
    if (qty === 0) {
      continue;
    }

    if (movement.direction === "in") {
      quantity += qty;
      valueMinor += qty * cost;
      if (method === "fifo") {
        lots.push({ quantity: qty, unitCostMinor: cost });
      }
      continue;
    }

    let toRemove = qty;
    if (method === "fifo") {
      while (toRemove > 0 && lots.length > 0) {
        const lot = lots[0];
        const taken = Math.min(toRemove, lot.quantity);
        costOfGoodsSoldMinor += taken * lot.unitCostMinor;
        lot.quantity -= taken;
        toRemove -= taken;
        if (lot.quantity === 0) {
          lots.shift();
        }
      }
      unfulfilledOutQuantity += toRemove;
      quantity = Math.max(0, quantity - (qty - toRemove));
      valueMinor = lots.reduce(
        (sum, lot) => sum + lot.quantity * lot.unitCostMinor,
        0,
      );
    } else {
      const available = Math.min(quantity, qty);
      const average = quantity > 0 ? valueMinor / quantity : 0;
      const removedValue = Math.round(available * average);
      costOfGoodsSoldMinor += removedValue;
      quantity -= available;
      valueMinor = Math.max(0, valueMinor - removedValue);
      unfulfilledOutQuantity += qty - available;
    }
  }

  return {
    quantity: Math.max(0, quantity),
    valueMinor: Math.max(0, Math.round(valueMinor)),
    averageCostMinor: quantity > 0 ? Math.round(valueMinor / quantity) : 0,
    costOfGoodsSoldMinor,
    unfulfilledOutQuantity,
  };
}

export function lowStockItems(
  stock: Array<{ itemId: string; location: string; quantity: number; reorderLevel: number }>,
) {
  return stock.filter((doc) => doc.quantity <= doc.reorderLevel);
}
