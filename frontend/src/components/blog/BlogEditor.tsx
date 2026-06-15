import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link, List, ListOrdered, Quote, Underline } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

type CommandButton = {
    label: string;
    icon: ComponentType<{ className?: string }>;
    command: string;
    value?: string;
};

const COMMANDS: CommandButton[] = [
    { label: "In đậm", icon: Bold, command: "bold" },
    { label: "In nghiêng", icon: Italic, command: "italic" },
    { label: "Gạch chân", icon: Underline, command: "underline" },
    { label: "Tiêu đề 2", icon: Heading2, command: "formatBlock", value: "h2" },
    { label: "Tiêu đề 3", icon: Heading3, command: "formatBlock", value: "h3" },
    { label: "Danh sách", icon: List, command: "insertUnorderedList" },
    { label: "Danh sách số", icon: ListOrdered, command: "insertOrderedList" },
    { label: "Trích dẫn", icon: Quote, command: "formatBlock", value: "blockquote" },
];

export default function BlogEditor({ value, onChange, placeholder }: Props) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        if (editor.innerHTML !== value) {
            editor.innerHTML = value || "";
        }
    }, [value]);

    function emitChange() {
        onChange(editorRef.current?.innerHTML || "");
    }

    function runCommand(command: string, commandValue?: string) {
        editorRef.current?.focus();
        document.execCommand(command, false, commandValue);
        emitChange();
    }

    function insertLink() {
        const url = window.prompt("Nhập URL liên kết");
        if (!url) return;

        runCommand("createLink", url);
    }

    function insertImage() {
        const trimmedUrl = imageUrl.trim();
        if (!trimmedUrl) return;

        runCommand("insertImage", trimmedUrl);
        setImageUrl("");
    }

    return (
        <div className="overflow-hidden rounded-lg border bg-background">
            <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
                {COMMANDS.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Button
                            key={`${item.command}-${item.value || item.label}`}
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={item.label}
                            onClick={() => runCommand(item.command, item.value)}
                            className="h-8 w-8 cursor-pointer"
                        >
                            <Icon className="h-4 w-4" />
                        </Button>
                    );
                })}

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Chèn liên kết"
                    onClick={insertLink}
                    className="h-8 w-8 cursor-pointer"
                >
                    <Link className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex flex-col gap-2 border-b bg-muted/20 p-2 sm:flex-row">
                <Input
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="Dán URL ảnh vào đây để chèn vào bài viết"
                    className="h-9"
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={insertImage}
                    disabled={!imageUrl.trim()}
                    className="h-9 cursor-pointer whitespace-nowrap"
                >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Chèn ảnh
                </Button>
            </div>

            <div className="relative">
                {!value && placeholder && (
                    <span className="pointer-events-none absolute left-4 top-4 text-muted-foreground">
                        {placeholder}
                    </span>
                )}

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={emitChange}
                    onBlur={emitChange}
                    className="min-h-[420px] w-full px-4 py-3 leading-7 outline-none [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_img]:my-4 [&_img]:max-h-[420px] [&_img]:w-full [&_img]:rounded-lg [&_img]:object-contain [&_ol]:list-decimal [&_ul]:list-disc"
                />
            </div>
        </div>
    );
}
