import prisma from "#config/prisma";
import AppError from "#utils/AppError";
import { normalizeText } from "#utils/normalizeText";
import { devices_status, inventory_transactions_type, Prisma } from "@prisma/client";
import * as XLSX from "xlsx";
import crypto from "crypto";

type ExcelRow = {
    rowNumber: number;
    productName: string;
    brandName: string;
    categoryName: string;
    description: string | null;
    warrantyPeriod: number;
    sku: string;
    price: number;
    quantityInStock: number;
    specs: string;
    attributeValuesByColumn: Record<string, string>;
};

type ImportError = {
    row: number;
    field: string;
    message: string;
};

const REQUIRED_HEADERS = [
    "productName",
    "brandName",
    "categoryName",
    "warrantyPeriod",
    "sku",
    "price",
    "quantityInStock",
];

const OPTIONAL_HEADERS = [
    "description",
    "specs",
];

const BASE_HEADERS = [
    ...REQUIRED_HEADERS,
    ...OPTIONAL_HEADERS,
];

const parseNumber = (value: unknown) => {
    if(value === null || value === undefined || value === "") return NaN;
    return Number(value);
};

const getCellText = (row: Record<string, unknown>, key: string) => {
    return String(row[key] ?? "").trim();
};

const parseKeyValueList = (raw: string) => {
    if(!raw.trim()) return [];

    return raw
        .split(";")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
            const [key, ...rest] = item.split(":");
            const value = rest.join(":");

            return {
                key: String(key ?? "").trim(),
                value: String(value ?? "").trim(),
            };
        });
};

const buildComboKey = (attributeValueIds: string[]) => {
    return [...attributeValueIds].sort().join("|");
};

const readRowsFromExcel = (file: Express.Multer.File) => {
    const workbook = XLSX.read(file.buffer, {
        type: "buffer",
        cellDates: false,
    });

    const firstSheetName = workbook.SheetNames[0];

    if(!firstSheetName) {
        throw new AppError("File Excel không có sheet dữ liệu.", 400);
    }

    const sheet = workbook.Sheets[firstSheetName];

    const jsonRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
    });

    if(jsonRows.length === 0) {
        throw new AppError("File Excel không có dữ liệu.", 400);
    }

    const headers = Object.keys(jsonRows[0] ?? {});
    const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

    if(missingHeaders.length > 0) {
        throw new AppError(`File Excel thiếu cột: ${missingHeaders.join(", ")}`, 400);
    }

    const duplicateAttributeHeaders = new Set<string>();
    const normalizedHeaderSet = new Set<string>();

    for(const header of headers) {
        if(BASE_HEADERS.includes(header)) continue;

        const normalizedHeader = normalizeText(header);

        if(normalizedHeaderSet.has(normalizedHeader)) {
            duplicateAttributeHeaders.add(header);
        }

        normalizedHeaderSet.add(normalizedHeader);
    }

    if(duplicateAttributeHeaders.size > 0) {
        throw new AppError(
            `File Excel có cột thuộc tính bị trùng: ${[...duplicateAttributeHeaders].join(", ")}`,
            400,
        );
    }

    const attributeColumns = headers.filter((header) => !BASE_HEADERS.includes(header));

    return jsonRows.map((row, index): ExcelRow => {
        const attributeValuesByColumn: Record<string, string> = {};

        for(const attributeColumn of attributeColumns) {
            const value = getCellText(row, attributeColumn);

            if(value) {
                attributeValuesByColumn[attributeColumn] = value;
            }
        }

        return {
            rowNumber: index + 2,
            productName: getCellText(row, "productName"),
            brandName: getCellText(row, "brandName"),
            categoryName: getCellText(row, "categoryName"),
            description: getCellText(row, "description") || null,
            warrantyPeriod: parseNumber(row.warrantyPeriod),
            sku: getCellText(row, "sku").toUpperCase(),
            price: parseNumber(row.price),
            quantityInStock: parseNumber(row.quantityInStock),
            specs: getCellText(row, "specs"),
            attributeValuesByColumn,
        };
    });
};

const getAttributeValueIds = (
    row: ExcelRow,
    attributeMap: Map<string, Prisma.product_attributesGetPayload<{
        include: { attribute_values: true };
    }>>,
) => {
    return Object.entries(row.attributeValuesByColumn).map(([attributeName, attributeValueText]) => {
        const attribute = attributeMap.get(normalizeText(attributeName));
        const attributeValue = attribute?.attribute_values.find((value) => {
            return value.normalized_value === normalizeText(attributeValueText);
        });

        return attributeValue?.attribute_value_id as string;
    });
};

export const importProductsFromExcelService = async(
    file: Express.Multer.File | undefined,
    createdBy?: string,
) => {
    if(!file) {
        throw new AppError("Vui lòng chọn file Excel.", 400);
    }

    const rows = readRowsFromExcel(file);
    const errors: ImportError[] = [];

    const skuInFileSet = new Set<string>();
    const normalizedProductNames = new Set<string>();
    const normalizedBrandNames = new Set<string>();
    const normalizedCategoryNames = new Set<string>();

    for(const row of rows) {
        if(!row.productName) {
            errors.push({
                row: row.rowNumber,
                field: "productName",
                message: "Tên sản phẩm là bắt buộc.",
            });
        }

        if(!row.brandName) {
            errors.push({
                row: row.rowNumber,
                field: "brandName",
                message: "Thương hiệu là bắt buộc.",
            });
        }

        if(!row.categoryName) {
            errors.push({
                row: row.rowNumber,
                field: "categoryName",
                message: "Danh mục là bắt buộc.",
            });
        }

        if(!Number.isInteger(row.warrantyPeriod) || row.warrantyPeriod < 0) {
            errors.push({
                row: row.rowNumber,
                field: "warrantyPeriod",
                message: "Bảo hành phải là số nguyên không âm.",
            });
        }

        if(!row.sku) {
            errors.push({
                row: row.rowNumber,
                field: "sku",
                message: "SKU là bắt buộc.",
            });
        }else if(skuInFileSet.has(row.sku)) {
            errors.push({
                row: row.rowNumber,
                field: "sku",
                message: `SKU '${row.sku}' bị trùng trong file.`,
            });
        }else{
            skuInFileSet.add(row.sku);
        }

        if(!Number.isFinite(row.price) || row.price <= 0) {
            errors.push({
                row: row.rowNumber,
                field: "price",
                message: "Giá phải lớn hơn 0.",
            });
        }

        if(!Number.isInteger(row.quantityInStock) || row.quantityInStock < 0) {
            errors.push({
                row: row.rowNumber,
                field: "quantityInStock",
                message: "Tồn kho phải là số nguyên không âm.",
            });
        }

        for(const spec of parseKeyValueList(row.specs)) {
            if(!spec.key || !spec.value) {
                errors.push({
                    row: row.rowNumber,
                    field: "specs",
                    message: "Thông số phải có dạng 'Tên thông số:Giá trị', ví dụ 'Chip:A16;Man hinh:6.1 inch'.",
                });
            }
        }

        if(row.productName) {
            normalizedProductNames.add(normalizeText(row.productName));
        }

        if(row.brandName) {
            normalizedBrandNames.add(normalizeText(row.brandName));
        }

        if(row.categoryName) {
            normalizedCategoryNames.add(normalizeText(row.categoryName));
        }
    }

    if(errors.length > 0) {
        return {
            imported: false,
            totalRows: rows.length,
            errors,
        };
    }

    const [
        existedProducts,
        existedSkus,
        brands,
        categories,
        attributes,
    ] = await Promise.all([
        prisma.products.findMany({
            where: {
                normalized_name: {
                    in: [...normalizedProductNames],
                },
            },
            select: {
                normalized_name: true,
                product_name: true,
            },
        }),
        prisma.product_variants.findMany({
            where: {
                sku: {
                    in: [...skuInFileSet],
                },
            },
            select: {
                sku: true,
            },
        }),
        prisma.brands.findMany({
            where: {
                normalized_name: {
                    in: [...normalizedBrandNames],
                },
            },
        }),
        prisma.categories.findMany({
            where: {
                normalized_name: {
                    in: [...normalizedCategoryNames],
                },
            },
        }),
        prisma.product_attributes.findMany({
            include: {
                attribute_values: true,
            },
        }),
    ]);

    const brandMap = new Map(brands.map((brand) => [brand.normalized_name, brand]));
    const categoryMap = new Map(categories.map((category) => [category.normalized_name, category]));
    const attributeMap = new Map(attributes.map((attribute) => [attribute.normalized_name, attribute]));
    const existedProductNameSet = new Set(existedProducts.map((product) => product.normalized_name));
    const existedSkuSet = new Set(existedSkus.map((variant) => variant.sku));

    for(const row of rows) {
        const normalizedProductName = normalizeText(row.productName);
        const normalizedBrandName = normalizeText(row.brandName);
        const normalizedCategoryName = normalizeText(row.categoryName);

        if(existedProductNameSet.has(normalizedProductName)) {
            errors.push({
                row: row.rowNumber,
                field: "productName",
                message: `Sản phẩm '${row.productName}' đã tồn tại.`,
            });
        }

        if(existedSkuSet.has(row.sku)) {
            errors.push({
                row: row.rowNumber,
                field: "sku",
                message: `SKU '${row.sku}' đã tồn tại.`,
            });
        }

        if(!brandMap.has(normalizedBrandName)) {
            errors.push({
                row: row.rowNumber,
                field: "brandName",
                message: `Thương hiệu '${row.brandName}' không tồn tại.`,
            });
        }

        if(!categoryMap.has(normalizedCategoryName)) {
            errors.push({
                row: row.rowNumber,
                field: "categoryName",
                message: `Danh mục '${row.categoryName}' không tồn tại.`,
            });
        }

        for(const [attributeName, attributeValueText] of Object.entries(row.attributeValuesByColumn)) {
            const attribute = attributeMap.get(normalizeText(attributeName));

            if(!attribute) {
                errors.push({
                    row: row.rowNumber,
                    field: attributeName,
                    message: `Thuộc tính '${attributeName}' không tồn tại.`,
                });
                continue;
            }

            const value = attribute.attribute_values.find((attributeValue) => {
                return attributeValue.normalized_value === normalizeText(attributeValueText);
            });

            if(!value) {
                errors.push({
                    row: row.rowNumber,
                    field: attributeName,
                    message: `Giá trị '${attributeValueText}' của thuộc tính '${attributeName}' không tồn tại.`,
                });
            }
        }
    }

    if(errors.length > 0) {
        return {
            imported: false,
            totalRows: rows.length,
            errors,
        };
    }

    const productGroups = new Map<string, ExcelRow[]>();

    for(const row of rows) {
        const normalizedProductName = normalizeText(row.productName);
        const currentRows = productGroups.get(normalizedProductName) ?? [];
        currentRows.push(row);
        productGroups.set(normalizedProductName, currentRows);
    }

    for(const [, productRows] of productGroups) {
        const firstRow = productRows[0];
        const comboSet = new Set<string>();
        const expectedBrandName = normalizeText(firstRow.brandName);
        const expectedCategoryName = normalizeText(firstRow.categoryName);

        for(const row of productRows) {
            if(normalizeText(row.brandName) !== expectedBrandName) {
                errors.push({
                    row: row.rowNumber,
                    field: "brandName",
                    message: `Các dòng của sản phẩm '${row.productName}' phải cùng thương hiệu.`,
                });
            }

            if(normalizeText(row.categoryName) !== expectedCategoryName) {
                errors.push({
                    row: row.rowNumber,
                    field: "categoryName",
                    message: `Các dòng của sản phẩm '${row.productName}' phải cùng danh mục.`,
                });
            }

            const attributeValueIds = getAttributeValueIds(row, attributeMap);
            const comboKey = buildComboKey(attributeValueIds);

            if(comboKey && comboSet.has(comboKey)) {
                errors.push({
                    row: row.rowNumber,
                    field: "attributes",
                    message: `Biến thể bị trùng tổ hợp thuộc tính trong sản phẩm '${row.productName}'.`,
                });
            }

            if(comboKey) comboSet.add(comboKey);
        }
    }

    if(errors.length > 0) {
        return {
            imported: false,
            totalRows: rows.length,
            errors,
        };
    }

    const result = await prisma.$transaction(async(tx) => {
        let createdProductCount = 0;
        let createdVariantCount = 0;
        let createdDeviceCount = 0;

        for(const [normalizedProductName, productRows] of productGroups) {
            const firstRow = productRows[0];

            const productId = crypto.randomUUID();
            const brand = brandMap.get(normalizeText(firstRow.brandName));
            const category = categoryMap.get(normalizeText(firstRow.categoryName));

            if(!brand || !category) {
                throw new AppError("Dữ liệu brand/category không hợp lệ.", 400);
            }

            await tx.products.create({
                data: {
                    product_id: productId,
                    product_name: firstRow.productName.trim(),
                    normalized_name: normalizedProductName,
                    brand_id: brand.brand_id,
                    category_id: category.category_id,
                    description: firstRow.description,
                    warranty_period: firstRow.warrantyPeriod,
                },
            });

            createdProductCount++;

            const variantData: Prisma.product_variantsUncheckedCreateInput[] = [];
            const variantAttributeValueData: Prisma.variant_attribute_valuesUncheckedCreateInput[] = [];
            const specData: Prisma.product_variant_specsUncheckedCreateInput[] = [];
            const inventoryData: Prisma.inventory_transactionsUncheckedCreateInput[] = [];
            const deviceData: Prisma.devicesUncheckedCreateInput[] = [];

            for(const row of productRows) {
                const variantId = crypto.randomUUID();

                variantData.push({
                    variant_id: variantId,
                    product_id: productId,
                    sku: row.sku,
                    price: row.price,
                    quantity_in_stock: row.quantityInStock,
                    reserved_quantity: 0,
                    sold_quantity: 0,
                    image_url: null,
                    public_id: null,
                });

                createdVariantCount++;

                for(const [attributeName, attributeValueText] of Object.entries(row.attributeValuesByColumn)) {
                    const attribute = attributeMap.get(normalizeText(attributeName));
                    const attributeValue = attribute?.attribute_values.find((value) => {
                        return value.normalized_value === normalizeText(attributeValueText);
                    });

                    if(!attributeValue) {
                        throw new AppError("Dữ liệu thuộc tính không hợp lệ.", 400);
                    }

                    variantAttributeValueData.push({
                        variant_id: variantId,
                        attribute_value_id: attributeValue.attribute_value_id,
                    });
                }

                const specItems = parseKeyValueList(row.specs);

                for(let i = 0; i < specItems.length; i++) {
                    specData.push({
                        variant_id: variantId,
                        spec_key: specItems[i].key,
                        spec_value: specItems[i].value,
                        display_order: i,
                    });
                }

                inventoryData.push({
                    transaction_id: crypto.randomUUID(),
                    variant_id: variantId,
                    type: inventory_transactions_type.IMPORT,
                    quantity: row.quantityInStock,
                    before_quantity: 0,
                    after_quantity: row.quantityInStock,
                    note: "Nhập kho từ file Excel",
                    created_by: createdBy,
                    created_at: new Date(),
                });

                for(let i = 0; i < row.quantityInStock; i++) {
                    deviceData.push({
                        device_id: crypto.randomUUID(),
                        variant_id: variantId,
                        serial_number: `${row.sku}-${Date.now()}-${i + 1}`,
                        status: devices_status.AVAILABLE,
                    });
                }

                createdDeviceCount += row.quantityInStock;
            }

            await tx.product_variants.createMany({ data: variantData });

            if(variantAttributeValueData.length > 0) {
                await tx.variant_attribute_values.createMany({ data: variantAttributeValueData });
            }

            if(specData.length > 0) {
                await tx.product_variant_specs.createMany({ data: specData });
            }

            if(inventoryData.length > 0) {
                await tx.inventory_transactions.createMany({ data: inventoryData });
            }

            if(deviceData.length > 0) {
                await tx.devices.createMany({ data: deviceData });
            }
        }

        return {
            createdProductCount,
            createdVariantCount,
            createdDeviceCount,
        };
    });

    return {
        imported: true,
        totalRows: rows.length,
        errors: [],
        ...result,
    };
};
