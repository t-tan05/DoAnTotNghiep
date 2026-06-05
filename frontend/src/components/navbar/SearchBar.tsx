import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <form className="relative flex-1">
            <input 
                type="text" 
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
        </form>
    )
}