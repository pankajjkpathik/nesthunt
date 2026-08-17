export type JourneyEntityType = "project" | "builder" | "place";

export interface JourneyItem {
  type: JourneyEntityType;
  id: string;
  savedAt: string;
}

const STORAGE_KEY = "nesthunt_journey_v1";

export const JourneyService = {
  getItems(): JourneyItem[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse journey items", e);
      return [];
    }
  },

  addItem(type: JourneyEntityType, id: string): JourneyItem[] {
    const items = this.getItems();
    if (items.some((item) => item.type === type && item.id === id)) {
      return items;
    }

    const newItems: JourneyItem[] = [
      { type, id, savedAt: new Date().toISOString() },
      ...items,
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new Event("journey-updated"));
    return newItems;
  },

  removeItem(type: JourneyEntityType, id: string): JourneyItem[] {
    const items = this.getItems();
    const newItems = items.filter((item) => !(item.type === type && item.id === id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new Event("journey-updated"));
    return newItems;
  },

  isSaved(type: JourneyEntityType, id: string): boolean {
    const items = this.getItems();
    return items.some((item) => item.type === type && item.id === id);
  },
};
