import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Extension } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import UnderlineExtension from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    Link,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo2,
    RemoveFormatting,
    Strikethrough,
    Underline,
    Undo2,
} from "lucide-react";
import { useEffect, useState } from "react";

const FONT_SIZE_OPTIONS = [
    { label: "Mặc định", value: "" },
    { label: "Nhỏ", value: "14px" },
    { label: "Bình thường", value: "16px" },
    { label: "Lớn", value: "18px" },
    { label: "Rất lớn", value: "22px" },
    { label: "Tiêu đề", value: "28px" },
];

const LINE_HEIGHT_OPTIONS = [
    { label: "Dòng mặc định", value: "" },
    { label: "1.3", value: "1.3" },
    { label: "1.5", value: "1.5" },
    { label: "1.7", value: "1.7" },
    { label: "2.0", value: "2" },
];

const LineHeight = Extension.create({
    name: "lineHeight",

    addGlobalAttributes() {
        return [
            {
                types: ["heading", "paragraph"],
                attributes: {
                    lineHeight: {
                        default: null,
                        parseHTML: (element) => element.style.lineHeight || null,
                        renderHTML: (attributes) => {
                            if (!attributes.lineHeight) return {};

                            return {
                                style: `line-height: ${attributes.lineHeight}`,
                            };
                        },
                    },
                },
            },
        ];
    },
});

const FontSize = Extension.create({
    name: "fontSize",

    addGlobalAttributes() {
        return [
            {
                types: ["textStyle"],
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => element.style.fontSize || null,
                        renderHTML: (attributes) => {
                            if (!attributes.fontSize) return {};

                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
});

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeightClassName?: string;
};

export default function RichTextEditor({
    value,
    onChange,
    placeholder,
    minHeightClassName = "min-h-[360px]",
}: Props) {
    const [imageUrl, setImageUrl] = useState("");

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            FontSize,
            UnderlineExtension,
            LineHeight,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: "noreferrer",
                    target: "_blank",
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: "rich-text-image",
                },
            }),
        ],
        content: value || "",
        editorProps: {
            attributes: {
                class: [
                    "px-4 py-3 leading-7 outline-none",
                    minHeightClassName,
                    "[&_a]:text-primary [&_a]:underline",
                    "[&_blockquote]:my-5 [&_blockquote]:border-0 [&_blockquote]:bg-muted/60 [&_blockquote]:px-5 [&_blockquote]:py-3 [&_blockquote]:text-center [&_blockquote]:text-sm [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
                    "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight",
                    "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:leading-tight",
                    "[&_img]:my-4 [&_img]:max-h-[420px] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-contain",
                    "[&_ol]:my-2 [&_ol]:ml-6 [&_ol]:list-decimal [&_ul]:my-2 [&_ul]:ml-6 [&_ul]:list-disc",
                    "[&_li]:my-1 [&_li>p]:my-0",
                    "[&_p]:my-2",
                ].join(" "),
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if(!editor) return;
        if(editor.getHTML() === (value || "")) return;

        editor.commands.setContent(value || "", { emitUpdate: false });
    }, [editor, value]);

    function setLink() {
        if(!editor) return;

        const currentHref = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Nhập URL liên kết", currentHref || "");

        if(url === null) return;
        if(!url.trim()) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
    }

    function insertImage() {
        const url = imageUrl.trim();
        if(!editor || !url) return;

        editor.chain().focus().setImage({ src: url }).run();
        setImageUrl("");
    }

    function setFontSize(fontSize: string) {
        if(!editor) return;

        if(!fontSize) {
            editor.chain().focus().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run();
            return;
        }

        editor.chain().focus().setMark("textStyle", { fontSize }).run();
    }

    function setLineHeight(lineHeight: string) {
        if(!editor) return;

        const value = lineHeight || null;
        const chain = editor.chain().focus();

        if(editor.isActive("heading")) {
            chain.updateAttributes("heading", { lineHeight: value }).run();
            return;
        }

        chain.updateAttributes("paragraph", { lineHeight: value }).run();
    }

    function getCurrentLineHeight() {
        if(!editor) return "";

        return (
            editor.getAttributes("heading").lineHeight
            || editor.getAttributes("paragraph").lineHeight
            || ""
        );
    }

    const disabled = !editor;
    const currentFontSize = editor?.getAttributes("textStyle").fontSize || "";
    const currentLineHeight = getCurrentLineHeight();

    return (
        <div className="overflow-hidden rounded-lg border bg-background">
            <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
                <select
                    title="Cỡ chữ"
                    value={currentFontSize}
                    disabled={disabled}
                    onChange={(event) => setFontSize(event.target.value)}
                    className="h-8 cursor-pointer rounded-md border bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {FONT_SIZE_OPTIONS.map((option) => (
                        <option key={option.label} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    title="Khoảng cách dòng"
                    value={currentLineHeight}
                    disabled={disabled}
                    onChange={(event) => setLineHeight(event.target.value)}
                    className="h-8 cursor-pointer rounded-md border bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {LINE_HEIGHT_OPTIONS.map((option) => (
                        <option key={option.label} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <EditorButton
                    label="Hoàn tác"
                    disabled={disabled || !editor?.can().undo()}
                    onClick={() => editor?.chain().focus().undo().run()}
                >
                    <Undo2 className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Làm lại"
                    disabled={disabled || !editor?.can().redo()}
                    onClick={() => editor?.chain().focus().redo().run()}
                >
                    <Redo2 className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="In đậm"
                    active={editor?.isActive("bold")}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="In nghiêng"
                    active={editor?.isActive("italic")}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Gạch chân"
                    active={editor?.isActive("underline")}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                >
                    <Underline className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Gạch ngang"
                    active={editor?.isActive("strike")}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Tiêu đề 2"
                    active={editor?.isActive("heading", { level: 2 })}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Tiêu đề 3"
                    active={editor?.isActive("heading", { level: 3 })}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    <Heading3 className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Danh sách"
                    active={editor?.isActive("bulletList")}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Danh sách số"
                    active={editor?.isActive("orderedList")}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Trích dẫn"
                    active={editor?.isActive("blockquote")}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                >
                    <Quote className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Căn trái"
                    active={editor?.isActive({ textAlign: "left" })}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                >
                    <AlignLeft className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Căn giữa"
                    active={editor?.isActive({ textAlign: "center" })}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                >
                    <AlignCenter className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Căn phải"
                    active={editor?.isActive({ textAlign: "right" })}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().setTextAlign("right").run()}
                >
                    <AlignRight className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Căn đều"
                    active={editor?.isActive({ textAlign: "justify" })}
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
                >
                    <AlignJustify className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Chèn liên kết"
                    active={editor?.isActive("link")}
                    disabled={disabled}
                    onClick={setLink}
                >
                    <Link className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Đường kẻ ngang"
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                >
                    <Minus className="h-4 w-4" />
                </EditorButton>

                <EditorButton
                    label="Xóa định dạng"
                    disabled={disabled}
                    onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().unsetTextAlign().updateAttributes("paragraph", { lineHeight: null }).run()}
                >
                    <RemoveFormatting className="h-4 w-4" />
                </EditorButton>
            </div>

            <div className="flex flex-col gap-2 border-b bg-muted/20 p-2 sm:flex-row">
                <Input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="Dán URL ảnh vào đây để chèn vào nội dung"
                    className="h-9"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={insertImage}
                    disabled={!imageUrl.trim() || disabled}
                    className="h-9 cursor-pointer whitespace-nowrap"
                >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Chèn ảnh
                </Button>
            </div>

            <div className="relative">
                {!editor?.getText().trim() && placeholder && (
                    <span className="pointer-events-none absolute left-4 top-4 text-muted-foreground">
                        {placeholder}
                    </span>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

function EditorButton({
    label,
    active,
    disabled,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <Button
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="icon"
            title={label}
            disabled={disabled}
            onClick={onClick}
            className="h-8 w-8 cursor-pointer"
        >
            {children}
        </Button>
    );
}
