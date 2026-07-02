import Joi from "joi";
export const createCmsCollectionSchema = Joi.object({
    slug: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required()
        .messages({
        "string.base": "Slug phải là chuỗi",
        "string.empty": "Slug không được để trống",
        "string.min": "Slug phải có ít nhất {#limit} ký tự",
        "string.max": "Slug không được vượt quá {#limit} ký tự",
        "any.required": "Slug là bắt buộc",
    }),
    title: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .required()
        .messages({
        "string.base": "Tiêu đề phải là chuỗi",
        "string.empty": "Tiêu đề không được để trống",
        "string.min": "Tiêu đề phải có ít nhất {#limit} ký tự",
        "string.max": "Tiêu đề không được vượt quá {#limit} ký tự",
        "any.required": "Tiêu đề là bắt buộc",
    }),
    description: Joi.string()
        .allow("", null)
        .optional()
        .messages({
        "string.base": "Mô tả phải là chuỗi",
    }),
    pageType: Joi.string()
        .valid("HOME", "CATEGORY", "BRAND", "CAMPAIGN", "CUSTOM")
        .required()
        .messages({
        "string.base": "Loại trang phải là chuỗi",
        "any.only": "Loại trang chỉ được là HOME, CATEGORY, BRAND, CAMPAIGN hoặc CUSTOM",
        "any.required": "Loại trang là bắt buộc",
    }),
    categoryId: Joi.string()
        .allow(null)
        .optional()
        .messages({
        "string.base": "ID danh mục phải là chuỗi",
    }),
    brandId: Joi.string()
        .allow(null)
        .optional()
        .messages({
        "string.base": "ID thương hiệu phải là chuỗi",
    }),
    metadata: Joi.any()
        .optional(),
    sortOrder: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        "number.base": "Thứ tự sắp xếp phải là số",
        "number.integer": "Thứ tự sắp xếp phải là số nguyên",
        "number.min": "Thứ tự sắp xếp phải lớn hơn hoặc bằng {#limit}",
    }),
    isActive: Joi.boolean().
        optional()
        .messages({
        "boolean.base": "Trạng thái hoạt động phải là true hoặc false",
    }),
});
export const updateCmsCollectionSchema = Joi.object({
    slug: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .optional()
        .messages({
        "string.base": "Slug phải là chuỗi",
        "string.empty": "Slug không được để trống",
        "string.min": "Slug phải có ít nhất {#limit} ký tự",
        "string.max": "Slug không được vượt quá {#limit} ký tự",
    }),
    title: Joi.string()
        .trim()
        .min(2)
        .max(255)
        .optional()
        .messages({
        "string.base": "Tiêu đề phải là chuỗi",
        "string.empty": "Tiêu đề không được để trống",
        "string.min": "Tiêu đề phải có ít nhất {#limit} ký tự",
        "string.max": "Tiêu đề không được vượt quá {#limit} ký tự",
    }),
    description: Joi.string()
        .allow("", null)
        .optional()
        .messages({
        "string.base": "Mô tả phải là chuỗi",
    }),
    pageType: Joi.string()
        .valid("HOME", "CATEGORY", "BRAND", "CAMPAIGN", "CUSTOM")
        .optional()
        .messages({
        "string.base": "Loại trang phải là chuỗi",
        "any.only": "Loại trang chỉ được là HOME, CATEGORY, BRAND, CAMPAIGN hoặc CUSTOM",
    }),
    categoryId: Joi.string()
        .allow(null)
        .optional()
        .messages({
        "string.base": "ID danh mục phải là chuỗi",
    }),
    brandId: Joi.string()
        .allow(null)
        .optional()
        .messages({
        "string.base": "ID thương hiệu phải là chuỗi",
    }),
    metadata: Joi.any()
        .optional(),
    sortOrder: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        "number.base": "Thứ tự sắp xếp phải là số",
        "number.integer": "Thứ tự sắp xếp phải là số nguyên",
        "number.min": "Thứ tự sắp xếp phải lớn hơn hoặc bằng {#limit}",
    }),
    isActive: Joi.boolean()
        .optional()
        .messages({
        "boolean.base": "Trạng thái hoạt động phải là true hoặc false",
    }),
});
export const createCmsSectionSchema = Joi.object({
    sectionType: Joi.string()
        .valid("BANNER", "SHORTCUT_BUTTONS", "SHORTCUT_CARDS", "FEATURED_PRODUCTS", "BLOG_GRID", "PRODUCT_GRID")
        .required()
        .messages({
        "string.base": "Loại section phải là chuỗi",
        "any.only": "Loại section không hợp lệ",
        "any.required": "Loại section là bắt buộc",
    }),
    title: Joi.string()
        .allow("", null)
        .max(255)
        .optional()
        .messages({
        "string.base": "Tiêu đề phải là chuỗi",
        "string.max": "Tiêu đề không được vượt quá {#limit} ký tự",
    }),
    subtitle: Joi.string()
        .allow("", null)
        .max(255)
        .optional()
        .messages({
        "string.base": "Tiêu đề phụ phải là chuỗi",
        "string.max": "Tiêu đề phụ không được vượt quá {#limit} ký tự",
    }),
    backgroundImage: Joi.string()
        .allow("", null)
        .max(500)
        .optional()
        .messages({
        "string.base": "Ảnh nền phải là chuỗi",
        "string.max": "Ảnh nền không được vượt quá {#limit} ký tự",
    }),
    href: Joi.string()
        .allow("", null)
        .max(500)
        .optional()
        .messages({
        "string.base": "Liên kết phải là chuỗi",
        "string.max": "Liên kết không được vượt quá {#limit} ký tự",
    }),
    metadata: Joi.any()
        .optional(),
    sortOrder: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        "number.base": "Thứ tự sắp xếp phải là số",
        "number.integer": "Thứ tự sắp xếp phải là số nguyên",
        "number.min": "Thứ tự sắp xếp phải lớn hơn hoặc bằng {#limit}",
    }),
    isActive: Joi.boolean()
        .optional()
        .messages({
        "boolean.base": "Trạng thái hoạt động phải là true hoặc false",
    }),
});
export const updateCmsSectionSchema = Joi.object({
    sectionType: Joi.string()
        .valid("BANNER", "SHORTCUT_BUTTONS", "SHORTCUT_CARDS", "FEATURED_PRODUCTS", "BLOG_GRID", "PRODUCT_GRID")
        .optional()
        .messages({
        "string.base": "Loại section phải là chuỗi",
        "any.only": "Loại section không hợp lệ",
        "any.required": "Loại section là bắt buộc",
    }),
    title: Joi.string()
        .allow("", null)
        .max(255)
        .optional()
        .messages({
        "string.base": "Tiêu đề phải là chuỗi",
        "string.max": "Tiêu đề không được vượt quá {#limit} ký tự",
    }),
    subtitle: Joi.string()
        .allow("", null)
        .max(255)
        .optional()
        .messages({
        "string.base": "Tiêu đề phụ phải là chuỗi",
        "string.max": "Tiêu đề phụ không được vượt quá {#limit} ký tự",
    }),
    backgroundImage: Joi.string()
        .allow("", null)
        .max(500)
        .optional()
        .messages({
        "string.base": "Ảnh nền phải là chuỗi",
        "string.max": "Ảnh nền không được vượt quá {#limit} ký tự",
    }),
    href: Joi.string()
        .allow("", null)
        .max(500)
        .optional()
        .messages({
        "string.base": "Liên kết phải là chuỗi",
        "string.max": "Liên kết không được vượt quá {#limit} ký tự",
    }),
    metadata: Joi.any()
        .optional(),
    sortOrder: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        "number.base": "Thứ tự sắp xếp phải là số",
        "number.integer": "Thứ tự sắp xếp phải là số nguyên",
        "number.min": "Thứ tự sắp xếp phải lớn hơn hoặc bằng {#limit}",
    }),
    isActive: Joi.boolean()
        .optional()
        .messages({
        "boolean.base": "Trạng thái hoạt động phải là true hoặc false",
    }),
});
export const createCmsSectionItemSchema = Joi.object({
    title: Joi.string()
        .allow("", null)
        .max(255)
        .optional()
        .messages({
        "string.base": "Tiêu đề phải là chuỗi",
        "string.max": "Tiêu đề không được vượt quá {#limit} ký tự",
    }),
    subtitle: Joi.string()
        .allow("", null)
        .max(255)
        .optional()
        .messages({
        "string.base": "Tiêu đề phụ phải là chuỗi",
        "string.max": "Tiêu đề phụ không được vượt quá {#limit} ký tự",
    }),
    imageUrl: Joi.string()
        .allow("", null)
        .max(500)
        .optional()
        .messages({
        "string.base": "Đường dẫn ảnh phải là chuỗi",
        "string.max": "Đường dẫn ảnh không được vượt quá {#limit} ký tự",
    }),
    href: Joi.string()
        .allow("", null)
        .max(500)
        .optional()
        .messages({
        "string.base": "Liên kết phải là chuỗi",
        "string.max": "Liên kết không được vượt quá {#limit} ký tự",
    }),
    productId: Joi.string()
        .allow(null)
        .optional()
        .messages({
        "string.base": "ID sản phẩm phải là chuỗi",
    }),
    variantId: Joi.string()
        .allow(null)
        .optional()
        .messages({
        "string.base": "ID biến thể phải là chuỗi",
    }),
    blogId: Joi.string()
        .allow(null)
        .optional()
        .messages({
        "string.base": "ID bài viết phải là chuỗi",
    }),
    metadata: Joi.any()
        .optional(),
    sortOrder: Joi.number()
        .integer()
        .min(0)
        .optional()
        .messages({
        "number.base": "Thứ tự sắp xếp phải là số",
        "number.integer": "Thứ tự sắp xếp phải là số nguyên",
        "number.min": "Thứ tự sắp xếp phải lớn hơn hoặc bằng {#limit}",
    }),
    isActive: Joi.boolean()
        .optional()
        .messages({
        "boolean.base": "Trạng thái hoạt động phải là true hoặc false",
    }),
});
export const updateCmsSectionItemSchema = Joi.object({
    title: Joi.string()
        .allow("", null)
        .max(255)
        .optional(),
    subtitle: Joi.string()
        .allow("", null)
        .max(255)
        .optional(),
    imageUrl: Joi.string()
        .allow("", null)
        .max(500)
        .optional(),
    href: Joi.string()
        .allow("", null)
        .max(500)
        .optional(),
    productId: Joi.string()
        .allow(null)
        .optional(),
    variantId: Joi.string()
        .allow(null)
        .optional(),
    blogId: Joi.string()
        .allow(null)
        .optional(),
    metadata: Joi.any()
        .optional(),
    sortOrder: Joi.number()
        .integer()
        .min(0)
        .optional(),
    isActive: Joi.boolean()
        .optional(),
});
export const createCmsRuleSchema = Joi.object({
    categoryId: Joi.string()
        .allow(null)
        .optional(),
    brandId: Joi.string()
        .allow(null)
        .optional(),
    attributeName: Joi.string()
        .allow("", null)
        .max(100)
        .optional(),
    attributeValue: Joi.string()
        .allow("", null)
        .max(100)
        .optional(),
    keyword: Joi.string()
        .allow("", null)
        .max(255)
        .optional(),
    minPrice: Joi.number()
        .min(0)
        .allow(null)
        .optional(),
    maxPrice: Joi.number()
        .min(0)
        .allow(null)
        .optional(),
    sortBy: Joi.string()
        .valid("NEWEST", "PRICE_ASC", "PRICE_DESC", "BEST_SELLING", "PROMOTION")
        .optional(),
    limit: Joi.number()
        .integer()
        .min(1)
        .optional(),
    metadata: Joi.any()
        .optional(),
    isActive: Joi.boolean()
        .optional(),
});
export const updateCmsRuleSchema = Joi.object({
    categoryId: Joi.string()
        .allow(null)
        .optional(),
    brandId: Joi.string()
        .allow(null)
        .optional(),
    attributeName: Joi.string()
        .allow("", null)
        .max(100)
        .optional(),
    attributeValue: Joi.string()
        .allow("", null)
        .max(100)
        .optional(),
    keyword: Joi.string()
        .allow("", null)
        .max(255)
        .optional(),
    minPrice: Joi.number()
        .min(0)
        .allow(null)
        .optional(),
    maxPrice: Joi.number()
        .min(0)
        .allow(null)
        .optional(),
    sortBy: Joi.string()
        .valid("NEWEST", "PRICE_ASC", "PRICE_DESC", "BEST_SELLING", "PROMOTION")
        .optional(),
    limit: Joi.number()
        .integer()
        .min(1)
        .optional(),
    metadata: Joi.any()
        .optional(),
    isActive: Joi.boolean()
        .optional(),
});
