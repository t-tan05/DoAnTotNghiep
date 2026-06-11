import { useAuth } from "@/hooks/useAuth";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "../../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Link } from "react-router-dom";
import { LogOut, UserRound } from "lucide-react";

function getInitials(name?: string, email?: string) {
    const text = name || email || "A";
    return text?.charAt(0).toUpperCase();
};

export default function AdminAvatarMenu() {
    const { user, logout} = useAuth();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg_muted hover:cursor-pointer">
                    <Avatar className="size-9" >
                        <AvatarImage src="" alt={user?.name || "Admin"} />
                        <AvatarFallback>
                            {getInitials(user?.name, user?.email)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="hidden text-left md:block">
                        <p className="text-sm font-medium leading-none">
                            {user?.name || "Admin"}
                        </p>

                        <p className="mt-1 max-w-40 truncate text-xs text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="hover:cursor-pointer">
                    <Link to={"/account"}>
                        <UserRound className="size-4" />
                        Tài khoản cá nhân
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                    <LogOut className="size-4" />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

