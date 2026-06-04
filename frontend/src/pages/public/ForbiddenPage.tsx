import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ForbiddenPage(){
    return (
        <main className="min-h-screen bg-[#eeeeee]">
            <header className="bg-[#555555] px-10 py-3">
                <h1 className="text-3xl font-bold text-white">Server Error</h1>
            </header>

            <section className="mx-10 mt-3 bg-white p-3">
                <div className="border border-zinc-400 px-5 py-4">
                    <h2 className="text-2xl font-bold textt-red-600">
                        403 - Forbidden: Access is denied.
                    </h2>

                    <p className="mt-3 text-base font-semibold text-black">
                        You do not have permission to view this directory or page using the credentials that you supplied.
                    </p>

                    <div className="mt-5">
                        <Button asChild>
                            <Link to="/">Về trang chủ</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    )
}