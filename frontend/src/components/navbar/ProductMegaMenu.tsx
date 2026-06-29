import { Link } from "react-router-dom";
import { productCategories } from "./navbar.data";

export default function ProductMegaMenu(){
    return (
        <div 
            className={[
                "absolute left-0 top-full z-50 w-full border-t bg-white shadow-sm",
                "invisible translate-y-3 opacity-0 pointer-events-none",
                "transition-all duration-300 ease-out",
                "group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:pointer-events-auto",
            ].join(" ")}
        >
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-12 px-8 py-12">
                {productCategories.map((group) => (
                    <div className="space-y-3" key={group.title}>
                        <h3 className="text-lg font-bold text-foreground">
                            {group.title}
                        </h3>

                        <ul className="space-y-3">
                            {group.items.map((item) => (
                                <li key={item}>
                                    <Link 
                                        to={`/products?search=${encodeURIComponent(item)}`}
                                        className="text-base text-muted-foreground transition hover:text-blue-700"
                                    >
                                        {item}
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