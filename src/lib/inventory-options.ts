type OptionRow = Record<string, unknown> & { id: string };

export interface InventoryItemOption {
  id: string;
  name: string;
  reorderLevel: number;
}

export interface InventoryOptions {
  items: InventoryItemOption[];
}

export function inventoryOptions(items: OptionRow[]): InventoryOptions {
  return {
    items: items
      .map((item) => {
        const reorderLevel = Number(item.reorderLevel ?? 0);
        return {
          id: item.id,
          name: String(item.name ?? item.id),
          reorderLevel: Number.isFinite(reorderLevel) ? reorderLevel : 0,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}
