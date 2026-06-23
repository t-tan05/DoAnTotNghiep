import prisma from "#config/prisma";
import ExcelJS from "exceljs";

const BASE_HEADERS = [
    "productName",
    "brandName",
    "categoryName",
    "description",
    "warrantyPeriod",
    "sku",
    "variantName",
    "price",
    "quantityInStock",
    "specs",
];

export const createProductImportTemplateService = async () => {
    const [brands, categories, attributes] = await Promise.all([
        prisma.brands.findMany({
            orderBy: { brand_name: "asc" },
        }),
        prisma.categories.findMany({
            orderBy: { category_name: "asc" },
        }),
        prisma.product_attributes.findMany({
            include: {
                attribute_values: {
                    orderBy: { display_order: "asc" },
                },
            },
            orderBy: { display_order: "asc" },
        }),
    ]);

    const workbook = new ExcelJS.Workbook();

    workbook.creator = "DoAnTotNghiep";
    workbook.created = new Date();

    const productSheet = workbook.addWorksheet("Products");
    const brandSheet = workbook.addWorksheet("Brands");
    const categorySheet = workbook.addWorksheet("Categories");
    const attributeSheet = workbook.addWorksheet("Attributes");

    const attributeHeaders = attributes.map((attribute) => attribute.attribute_name);
    const headers = [...BASE_HEADERS, ...attributeHeaders];

    productSheet.addRow(headers);

    productSheet.addRow([
        "iPhone 15",
        brands[0]?.brand_name ?? "",
        categories[0]?.category_name ?? "",
        "iPhone 15 chính hãng",
        12,
        "IP15-BLACK-128",
        "iPhone 15 128GB Black",
        19990000,
        10,
        "Chip:A16;Màn hình:6.1 inch",
        ...attributeHeaders.map((attributeName) => {
            const attribute = attributes.find((item) => item.attribute_name === attributeName);
            return attribute?.attribute_values[0]?.value ?? "";
        }),
    ]);

    productSheet.views = [{ state: "frozen", ySplit: 1 }];

    productSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    productSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" },
    };

    productSheet.columns = headers.map((header) => ({
        header,
        key: header,
        width: Math.max(header.length + 4, 18),
    }));

    brandSheet.addRow(["brandName"]);
    brands.forEach((brand) => brandSheet.addRow([brand.brand_name]));

    categorySheet.addRow(["categoryName"]);
    categories.forEach((category) => categorySheet.addRow([category.category_name]));

    attributeSheet.addRow(["attributeName", "value"]);
    attributes.forEach((attribute) => {
        attribute.attribute_values.forEach((value) => {
            attributeSheet.addRow([attribute.attribute_name, value.value]);
        });
    });

    brandSheet.state = "veryHidden";
    categorySheet.state = "veryHidden";
    attributeSheet.state = "veryHidden";

    const maxRows = 500;

    for (let rowIndex = 2; rowIndex <= maxRows; rowIndex++) {
        productSheet.getCell(`B${rowIndex}`).dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: [`Brands!$A$2:$A$${brands.length + 1}`],
            showErrorMessage: true,
            errorTitle: "Thương hiệu không hợp lệ",
            error: "Vui lòng chọn thương hiệu trong danh sách.",
        };

        productSheet.getCell(`C${rowIndex}`).dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: [`Categories!$A$2:$A$${categories.length + 1}`],
            showErrorMessage: true,
            errorTitle: "Danh mục không hợp lệ",
            error: "Vui lòng chọn danh mục trong danh sách.",
        };
    }

    attributes.forEach((attribute, index) => {
        const columnNumber = BASE_HEADERS.length + index + 1;
        const columnLetter = productSheet.getColumn(columnNumber).letter;

        const values = attribute.attribute_values;

        if (values.length === 0) return;

        const helperColumn = index + 3;

        values.forEach((value, valueIndex) => {
            attributeSheet.getCell(valueIndex + 2, helperColumn).value = value.value;
        });

        for (let rowIndex = 2; rowIndex <= maxRows; rowIndex++) {
            productSheet.getCell(`${columnLetter}${rowIndex}`).dataValidation = {
                type: "list",
                allowBlank: true,
                formulae: [
                    `Attributes!$${attributeSheet.getColumn(helperColumn).letter}$2:$${attributeSheet.getColumn(helperColumn).letter}$${values.length + 1}`,
                ],
                showErrorMessage: true,
                errorTitle: "Thuộc tính không hợp lệ",
                error: `Vui lòng chọn giá trị hợp lệ cho ${attribute.attribute_name}.`,
            };
        }
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer;
};
