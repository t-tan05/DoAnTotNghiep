import {
    createContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth.type";
import { socket } from "@/lib/socket";

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string, redirectTo?: string) => Promise<void>;
    logout: () => Promise<void>;
    reloadUser: () => Promise<AuthUser | null>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({children}:AuthProviderProps) {
    const navigate = useNavigate();

    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = Boolean(user);

    async function reloadUser() {
        const token = localStorage.getItem("accessToken");

        if(!token){
            setUser(null);
            return null;
        }

        const res = await authService.me();
        const currentUser = res.data.data;
        setUser(currentUser);

        return currentUser;
    }

    async function login(email: string, password: string, redirectTo?: string) {
        const res = await authService.login({email, password});

        const accessToken = res.data.data?.accessToken;
        const mustChangePassword = Boolean(res.data.data?.mustChangePassword);

        if (!accessToken) {
            throw new Error("Backend không trả accessToken.");
        }

        localStorage.setItem("accessToken", accessToken);

        const currentUser = await reloadUser();

        if (mustChangePassword || currentUser?.must_change_password) {
            navigate("/account/password");
            return;
        }

        if (redirectTo && !currentUser?.roles?.includes("ADMIN") && !currentUser?.roles?.includes("EMPLOYEE")) {
            navigate(redirectTo);
            return;
        }

        if (currentUser?.roles?.includes("ADMIN")) {
            navigate("/admin");
        } else if (currentUser?.roles?.includes("EMPLOYEE")) {
            navigate("/employee");
        } else {
            navigate("/");
        }
    }

    async function logout(){
        try{
            await authService.logout();
        }finally{
            localStorage.removeItem("accessToken");
            socket.disconnect();
            setUser(null);
            navigate("/");
        }
    }

    useEffect(() => {
        async function initAuth() {
            try{
                await reloadUser();
            }catch {
                localStorage.removeItem("accessToken");
                setUser(null);
            }finally{
                setLoading(false);
            }
        }

        initAuth();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        const isStaff = user?.roles?.some((role) => role === "ADMIN" || role === "EMPLOYEE");

        if(!token || !isStaff) return;

        socket.auth = { token };

        if(socket.connected) {
            socket.disconnect();
        }

        socket.connect();
    }, [user]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                login,
                logout,
                reloadUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
