export const queryKeys = {
    cart: {
        all: ["cart"] as const,
        me: () => [...queryKeys.cart.all, "me"] as const,
    },
    cms: {
        all: ["cms"] as const,
        publicCollection: (slug: string) => [...queryKeys.cms.all, "public-collection", slug] as const,
        publicCollectionProducts: (
            slug: string,
            params: Record<string, string | number | boolean>,
        ) => [...queryKeys.cms.all, "public-collection-products", slug, params] as const,
    },
    products: {
        all: ["products"] as const,
        detail: (productId: string) => [...queryKeys.products.all, "detail", productId] as const,
        related: (productId: string) => [...queryKeys.products.all, "related", productId] as const,
    },
    reviews: {
        all: ["reviews"] as const,
        product: (productId: string, rating: number | "all") =>
            [...queryKeys.reviews.all, "product", productId, rating] as const,
    },
    wishlist: {
        all: ["wishlist"] as const,
        check: (variantId: string) => [...queryKeys.wishlist.all, "check", variantId] as const,
        checkMany: (variantIds: string[]) =>
            [...queryKeys.wishlist.all, "check-many", ...variantIds] as const,
        me: (page: number, limit: number) => [...queryKeys.wishlist.all, "me", page, limit] as const,
    },
};
