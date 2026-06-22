import { Heart, ShoppingCart, SquarePen } from "lucide-react";
import { Link } from "react-router-dom";
import UserDropdown from "./UserDropdown";

type CircleActionType = {
    to: string,
    children: React.ReactNode,
    label: string,
};

function CircleAction({
    to,
    children,
    label,
}: CircleActionType) {
    return (
        <Link
            to={to}
            aria-label={label}
            className="flex size-10 items-center justify-center rounded-full bg-blue-700 text-white transition hover:bg-blue-800 md:size-12"
        >
            {children}
        </Link>
    )
};

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

            <CircleAction to="/wishlist" label="Yêu thích">
                <Heart className="size-5 md:size-6"/>
            </CircleAction>

            <UserDropdown />

            <CircleAction to="/cart" label="Giỏ hàng">
                <ShoppingCart className="size-5 md:size-6"/>
            </CircleAction>
        </div>
    )
}