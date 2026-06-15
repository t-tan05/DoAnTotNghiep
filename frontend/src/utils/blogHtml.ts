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

const ALLOWED_ATTRIBUTES = new Set(["href", "src", "alt", "title", "target", "rel"]);

function isSafeUrl(value: string) {
    if (!value) return false;

    try {
        const url = new URL(value, window.location.origin);
        return ["http:", "https:", "mailto:"].includes(url.protocol);
    } catch {
        return false;
    }
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
