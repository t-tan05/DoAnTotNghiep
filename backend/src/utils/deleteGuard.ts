type DeleteUsageItem = {
    label: string;
    count: number;
};

export const buildDeleteBlockedMessage = (
    entityName: string,
    usages: DeleteUsageItem[],
) => {
    const activeUsages = usages.filter((item) => item.count > 0);

    if(activeUsages.length === 0) return "";

    const usageText = activeUsages
        .map((item) => `${item.count} ${item.label}`)
        .join(", ");

    return `Không thể xóa ${entityName} vì đang có ${usageText} sử dụng.`;
}