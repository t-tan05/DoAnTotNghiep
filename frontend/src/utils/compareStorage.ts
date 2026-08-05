export const COMPARE_STORAGE_KEY = "compare:items";
const COMPARE_REPLACE_INDEX_KEY = "compare:replace-index";
export const COMPARE_CHANGED_EVENT = "compare:changed";
export const MAX_COMPARE_ITEMS = 3;

export type CompareItem = {
    productId: string;
    variantId: string;
};

export type AddCompareResult = {
    success: boolean;
    reason: "exists" | "limit" | "replaced" | "added";
    items: CompareItem[];
};

function emitCompareChanged() {
    window.dispatchEvent(new Event(COMPARE_CHANGED_EVENT));
}

function getReplaceIndex() {
    const value = Number(localStorage.getItem(COMPARE_REPLACE_INDEX_KEY) || 0);

    if(!Number.isFinite(value)) return 0;

    return Math.min(Math.max(value, 0), MAX_COMPARE_ITEMS - 1);
}

function setReplaceIndex(value: number) {
    localStorage.setItem(COMPARE_REPLACE_INDEX_KEY, String(value % MAX_COMPARE_ITEMS));
}

export function getCompareItems(): CompareItem[] {
    try {
        const raw = localStorage.getItem(COMPARE_STORAGE_KEY);
        const items = raw ? JSON.parse(raw) : [];

        if(!Array.isArray(items)) return [];

        return items
            .filter((item) => item?.productId && item?.variantId)
            .slice(0, MAX_COMPARE_ITEMS);
    }catch{
        return [];
    }
}

export function setCompareItems(items: CompareItem[]) {
    localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(items.slice(0, MAX_COMPARE_ITEMS)));
    emitCompareChanged();
}

export function addCompareItem(item: CompareItem): AddCompareResult {
    const currentItems = getCompareItems();
    const exists = currentItems.some((row) => row.variantId === item.variantId);

    if(exists) {
        return {
            success: true,
            reason: "exists" as const,
            items: currentItems,
        };
    }

    if(currentItems.length >= MAX_COMPARE_ITEMS) {
        const replaceIndex = getReplaceIndex();
        const nextItems = [...currentItems];
        nextItems[replaceIndex] = item;

        setReplaceIndex(replaceIndex + 1);
        setCompareItems(nextItems);

        return {
            success: true,
            reason: "replaced" as const,
            items: nextItems,
        };
    }

    const nextItems = [...currentItems, item];
    if(nextItems.length >= MAX_COMPARE_ITEMS) {
        setReplaceIndex(0);
    }

    setCompareItems(nextItems);

    return {
        success: true,
        reason: "added" as const,
        items: nextItems,
    };
}

export function removeCompareItem(variantId: string) {
    const nextItems = getCompareItems().filter((item) => item.variantId !== variantId);
    setCompareItems(nextItems);
}

export function clearCompareItems() {
    localStorage.removeItem(COMPARE_STORAGE_KEY);
    localStorage.removeItem(COMPARE_REPLACE_INDEX_KEY);
    emitCompareChanged();
}
