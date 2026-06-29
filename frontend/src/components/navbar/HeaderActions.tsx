import { SquarePen } from "lucide-react";
import CartDropdown from "./CartDropdown";
import UserDropdown from "./UserDropdown";

export default function HeaderActions(){
    return (
        <div className="flex items-center gap-3">
            <a href="tel:0909493175"
                className="hidden items-center gap-3 rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-300 md:flex"
            >
                <SquarePen className="size-5" />

                <span className="leading-tight">
                    <span className="block font-medium">Tư vấn mua hàng</span>
                    <span className="block text-base font-bold">0909493175</span>
                </span>
            </a>

            <UserDropdown />

            <CartDropdown />
        </div>
    )
}
