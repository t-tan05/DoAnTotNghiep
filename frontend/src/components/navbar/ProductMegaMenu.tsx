import { Link } from "react-router-dom";
import type { DropdownMenuGroup } from "./navbar.data";

type ProductMegaMenuProps = {
    groups: DropdownMenuGroup[];
};

export default function ProductMegaMenu({ groups }: ProductMegaMenuProps) {
    const isSingleColumn = groups.length === 1;

    return (
        <div
            className={[
                "absolute left-1/2 top-full z-50 -translate-x-1/2 border bg-white shadow-lg",
                isSingleColumn ? "min-w-[240px]" : "min-w-[520px]",
                "invisible translate-y-3 opacity-0 pointer-events-none",
                "transition-all duration-300 ease-out",
                "group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-hover/nav:pointer-events-auto",
            ].join(" ")}
        >
            <div
                className={[
                    "grid gap-10 px-8 py-7",
                    isSingleColumn ? "grid-cols-1" : "grid-cols-2",
                ].join(" ")}
            >
                {groups.map((group) => (
                    <div className="space-y-3" key={group.title}>
                        {group.href ? (
                            <Link
                                to={group.href}
                                className="inline-block text-lg font-bold text-[#005ecb] transition hover:text-blue-700"
                            >
                                {group.title}
                            </Link>
                        ) : (
                            <h3 className="text-lg font-bold text-[#005ecb]">
                                {group.title}
                            </h3>
                        )}

                        <ul className="space-y-3">
                            {group.items.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        to={item.href}
                                        className="text-base text-muted-foreground transition hover:text-blue-700"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
