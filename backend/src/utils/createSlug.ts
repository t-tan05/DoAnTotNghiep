import { normalizeText } from "./normalizeText.js";

export const createSlug = (text: string) => {
    return normalizeText(text)
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};