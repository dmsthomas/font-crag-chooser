export interface Prefs {
  kidsInGroup: boolean;
}

const KEY = 'fcc:prefs';

const DEFAULT: Prefs = {
  kidsInGroup: true,
};

export function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return DEFAULT;
  }
}

export function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}
