import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <main 
            className="relative min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
            style={{
                backgroundImage: "url('/assets/pageNotFound.png')",
            }}>

            <div className="absolute inset-0 bg-black/40" />
            <section className="relative z-10 w-full max-w-md rounded-xl border bg-background/90 p-6 text-center shadow-sm backdrop-blur">
                <p className="text-sm font-medium text-muted-foreground">404</p>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                Không tìm thấy trang
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                Trang bạn đang truy cập không tồn tại.
                </p>

                <Button asChild className="mt-6">
                <Link to="/">Về trang chủ</Link>
                </Button>
            </section>
        </main>
    );
}