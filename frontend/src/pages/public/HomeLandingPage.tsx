import HeroSlider from "@/components/banner/HeroSlider";
import PageLoading from "@/components/common/PageLoading";
import PublicCmsSections from "@/components/cms/PublicCmsSections";
import TechNewsSection from "@/components/home/TechNewsSection";
import { blogService } from "@/services/blog.service";
import { cmsService } from "@/services/cms.service";
import type { Blog } from "@/types/blog.type";
import type { CmsCollection } from "@/types/cms.type";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function HomeLandingPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [homeCollection, setHomeCollection] = useState<CmsCollection | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadHomeData() {
        try {
            setLoading(true);

            const [cmsData, blogData] = await Promise.all([
                cmsService.getPublicCollection("home").catch(() => null),
                blogService.getPublic({
                    page: 1,
                    limit: 4,
                    sortBy: "published_at",
                    sortOrder: "desc",
                }),
            ]);

            setHomeCollection(cmsData?.page_type === "HOME" ? cmsData : null);
            setBlogs(blogData?.blogs ?? []);
        } catch(error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadHomeData();
    }, []);

    return (
        <main className="bg-[#f5f6fb] pb-8">
            <section className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-5">
                <HeroSlider />
            </section>

            {loading ? (
                <PageLoading text="Đang tải trang chủ..." />
            ) : homeCollection ? (
                <div className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-5">
                    <PublicCmsSections collection={homeCollection} productPageSize={4} />
                </div>
            ) : (
                <p>Nội dung đang trống</p>
            )}

            <section className="mx-auto max-w-7xl px-4 py-3 md:px-6 md:py-5">
                <TechNewsSection blogs={blogs} />
            </section>
            
        </main>
    );
}
