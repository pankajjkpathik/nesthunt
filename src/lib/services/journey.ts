export type JourneyEntityType = "project" | "builder" | "place";

export interface JourneyItem {
  type: JourneyEntityType;
  id: string;
  savedAt: string;
}

/**
 * USER PREFERENCE FOUNDATION (BUILD-032)
 * Separates user preference from NestHunt assessments.
 */
export type UserPreferencePriority = "high" | "medium" | "low" | "none";

export interface UserPreference {
  dimensionId: string;
  priority: UserPreferencePriority;
  weight?: number; // Optional normalized weight (High=3, Medium=2, Low=1, None=0)
}

const STORAGE_KEY = "nesthunt_journey_v1";
const PREFERENCES_KEY = "nesthunt_preferences_v1";

export const JourneyService = {
  // --- Journey Items (Entities) ---
  getItems(): JourneyItem[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
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

  // --- User Preferences (Decision Criteria) ---
  getPreferences(): UserPreference[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse user preferences", e);
      return [];
    }
  },

  setPreference(preference: UserPreference): UserPreference[] {
    const preferences = this.getPreferences();
    const filtered = preferences.filter(p => p.dimensionId !== preference.dimensionId);
    
    // Add mapping for weights (for future use, not scoring in BUILD-032)
    const weightMap: Record<UserPreferencePriority, number> = {
      high: 3,
      medium: 2,
      low: 1,
      none: 0
    };

    const newPref: UserPreference = {
      ...preference,
      weight: weightMap[preference.priority]
    };

    const newPreferences = [...filtered, newPref];
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    window.dispatchEvent(new Event("journey-updated"));
    return newPreferences;
  },

  removePreference(dimensionId: string): UserPreference[] {
    const preferences = this.getPreferences();
    const newPreferences = preferences.filter(p => p.dimensionId !== dimensionId);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    window.dispatchEvent(new Event("journey-updated"));
    return newPreferences;
  },

  resetPreferences(): UserPreference[] {
    localStorage.removeItem(PREFERENCES_KEY);
    window.dispatchEvent(new Event("journey-updated"));
    return [];
  }
};
