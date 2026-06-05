import { Search } from "lucide-react";

export default function SearchBar() {
    return (
        <form className="relative flex-1 max-w-3xl">
            <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="h-14 w-full rounded-full bg-muted px-7 pr-14 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <button
                type="submit"
                className="absolute right-5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-foreground transition hover:bg-muted-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Tìm kiếm"
            >
                <Search className="size-6"/>
            </button>
        </form>
    )
}