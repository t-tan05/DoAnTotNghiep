export const normalizeText = (text) => {
    return text.trim().replace(/\s+/g, " ").toLocaleLowerCase();
};
