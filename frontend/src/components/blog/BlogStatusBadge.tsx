import { Badge } from "@/components/ui/badge";
import type { BlogStatus } from "@/types/blog.type";

type Props = {
    status: BlogStatus;
};

export default function BlogStatusBadge({ status }: Props) {
    if (status === "PUBLISHED") {
        return <Badge>Đã public</Badge>;
    }

    if (status === "ARCHIVED") {
        return <Badge variant="secondary">Đã lưu trữ</Badge>;
    }

    return <Badge variant="outline">Bản nháp</Badge>;
}