import { cmsService } from "@/services/cms.service";
import type { PublicCmsCollectionSuggestion } from "@/types/cms.type";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function normalizeSlug(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u0111/g, "d")
        .replace(/\u0110/g, "d")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export default function SearchBar() {
    const navigate = useNavigate();
    const wrapperRef = useRef<HTMLFormElement | null>(null);
    const [keyword, setKeyword] = useState("");
    const [suggestions, setSuggestions] = useState<PublicCmsCollectionSuggestion[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const trimmedKeyword = keyword.trim();

    function goToCollection(collection: PublicCmsCollectionSuggestion) {
        setOpen(false);
        setKeyword(collection.title);
        navigate(`/c/${collection.slug}`);
    }

    function goToKeyword() {
        const exactMatch = suggestions.find((item) =>
            item.slug === normalizeSlug(trimmedKeyword)
            || item.title.toLowerCase() === trimmedKeyword.toLowerCase()
        );

        if(exactMatch) {
            goToCollection(exactMatch);
            return;
        }

        if(suggestions[0]) {
            goToCollection(suggestions[0]);
            return;
        }

        setOpen(true);
    }

    useEffect(() => {
        if(trimmedKeyword.length < 2) {
            setSuggestions([]);
            setLoading(false);
            setSearched(false);
            return;
        }

        const timer = window.setTimeout(async () => {
            try {
                setLoading(true);
                const data = await cmsService.getPublicCollectionSuggestions(trimmedKeyword, 6);
                setSuggestions(data.collections);
                setOpen(true);
                setSearched(true);
            }catch{
                setSuggestions([]);
                setSearched(true);
            }finally{
                setLoading(false);
            }
        }, 220);

        return () => window.clearTimeout(timer);
    }, [trimmedKeyword]);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if(!wrapperRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    return (
        <form
            ref={wrapperRef}
            className="relative flex-1"
            onSubmit={(event) => {
                event.preventDefault();
                goToKeyword();
            }}
        >
            <input
                type="text"
                value={keyword}
                onChange={(event) => {
                    setKeyword(event.target.value);
                    setOpen(true);
                    setSearched(false);
                }}
                onFocus={() => {
                    if(suggestions.length > 0) setOpen(true);
                }}
                placeholder="Tìm kiếm..."
                className="h-12 w-full rounded-full bg-muted px-5 pr-12 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-14 md:px-7 md:pr-14"
            />

            <button
                type="submit"
                className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition hover:bg-muted-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:right-5"
                aria-label="Tìm kiếm"
            >
                <Search className="size-5 md:size-6"/>
            </button>

            {open && trimmedKeyword.length >= 2 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] overflow-hidden rounded-md border bg-white shadow-xl">
                    {loading && suggestions.length === 0 ? (
                        <div className="px-5 py-4 text-sm text-muted-foreground">
                            Đang tìm gợi ý...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="py-2">
                            {suggestions.map((item) => (
                                <li key={item.collection_id}>
                                    <button
                                        type="button"
                                        onClick={() => goToCollection(item)}
                                        className="flex w-full cursor-pointer items-center gap-4 px-5 py-3 text-left transition hover:bg-muted/60"
                                    >
                                        <Search className="size-5 shrink-0 text-[#7b86a5]" />
                                        <span className="min-w-0">
                                            <span className="block truncate text-base font-medium text-foreground">
                                                {item.title}
                                            </span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : searched ? (
                        <div className="flex items-center gap-4 px-5 py-4 text-sm text-muted-foreground">
                            <Search className="size-5 shrink-0 text-[#7b86a5]" />
                            <span>Không có gợi ý phù hợp</span>
                        </div>
                    ) : null}
                </div>
            )}
        </form>
    )
}
