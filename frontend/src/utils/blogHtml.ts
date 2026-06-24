const ALLOWED_TAGS = new Set([
    "A",
    "B",
    "BLOCKQUOTE",
    "BR",
    "DIV",
    "EM",
    "H2",
    "H3",
    "HR",
    "I",
    "IMG",
    "LI",
    "OL",
    "P",
    "SPAN",
    "STRONG",
    "U",
    "UL",
]);

const ALLOWED_ATTRIBUTES = new Set(["href", "src", "alt", "title", "target", "rel", "style"]);

function isSafeUrl(value: string) {
    if (!value) return false;

    try {
        const url = new URL(value, window.location.origin);
        return ["http:", "https:", "mailto:"].includes(url.protocol);
    } catch {
        return false;
    }
}

function sanitizeStyle(value: string) {
    const safeStyles: string[] = [];
    const textAlignMatch = value.match(/(?:^|;)\s*text-align\s*:\s*(left|center|right|justify)\s*(?:;|$)/i);
    const fontSizeMatch = value.match(/(?:^|;)\s*font-size\s*:\s*(14px|16px|18px|22px|28px)\s*(?:;|$)/i);
    const lineHeightMatch = value.match(/(?:^|;)\s*line-height\s*:\s*(1\.3|1\.5|1\.7|2)\s*(?:;|$)/i);

    if (textAlignMatch) safeStyles.push(`text-align: ${textAlignMatch[1].toLowerCase()};`);
    if (fontSizeMatch) safeStyles.push(`font-size: ${fontSizeMatch[1].toLowerCase()};`);
    if (lineHeightMatch) safeStyles.push(`line-height: ${lineHeightMatch[1]};`);

    return safeStyles.join(" ");
}

export function sanitizeBlogHtml(html: string) {
    if (!html) return "";
    if (typeof window === "undefined") return html;

    const template = document.createElement("template");
    template.innerHTML = html;

    Array.from(template.content.querySelectorAll("*")).forEach((element) => {
        if (!ALLOWED_TAGS.has(element.tagName)) {
            element.replaceWith(...Array.from(element.childNodes));
            return;
        }

        Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value;

            if (name.startsWith("on") || !ALLOWED_ATTRIBUTES.has(name)) {
                element.removeAttribute(attribute.name);
                return;
            }

            if ((name === "href" || name === "src") && !isSafeUrl(value)) {
                element.removeAttribute(attribute.name);
            }

            if (name === "style") {
                const safeStyle = sanitizeStyle(value);

                if (safeStyle) {
                    element.setAttribute("style", safeStyle);
                } else {
                    element.removeAttribute(attribute.name);
                }
            }
        });

        if (element.tagName === "A") {
            element.setAttribute("target", "_blank");
            element.setAttribute("rel", "noreferrer");
        }
    });

    return template.innerHTML;
}

export function blogHtmlToText(html: string) {
    if (!html) return "";
    if (typeof window === "undefined") return html;

    const template = document.createElement("template");
    template.innerHTML = html;

    return (template.content.textContent || "").replace(/\s+/g, " ").trim();
}
