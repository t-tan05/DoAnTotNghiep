export const normalizeText = (text: string) => {
    return text.trim().replace(/\s+/g, " ").toLocaleLowerCase();
};

