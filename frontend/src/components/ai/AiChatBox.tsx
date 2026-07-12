import { aiService } from "@/services/ai.service";
import type { AiChatMessage, AiProductSuggestion } from "@/types/ai.type";
import { Bot, ChevronUp, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function formatPrice(value: number) {
    return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function ProductSuggestionCard({ item }: { item: AiProductSuggestion }) {
    const content = (
        <div className="flex w-full gap-2 rounded-lg border bg-white p-2 text-left text-sm shadow-sm transition hover:border-blue-600">
            {item.imageUrl && (
                <img
                    src={item.imageUrl}
                    alt={item.variantName || item.name}
                    className="h-14 w-14 shrink-0 rounded object-contain"
                />
            )}

            <div className="min-w-0">
                <p className="line-clamp-2 font-medium text-slate-800">
                    {item.variantName || item.name}
                </p>
                <p className="mt-1 font-bold text-blue-700">
                    {formatPrice(item.price)}
                </p>
            </div>
        </div>
    );

    if(!item.url) return content;

    return (
        <Link to={item.url} className="block w-full">
            {content}
        </Link>
    );
}

export default function AiChatBox() {
    const [open, setOpen] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<AiChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleScroll() {
            setShowScrollTop(window.scrollY > 360);
        }

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        async function loadLatestConversation() {
            try {
                const res = await aiService.getLatestConversation();

                setConversationId(res.data.conversation?.conversationId || null);
                setMessages(res.data.messages || []);
            } catch(error) {
                console.error("Load AI chat history failed:", error);
                setMessages([]);
            } finally {
                setHistoryLoaded(true);
            }
        }

        if(open && !historyLoaded) {
            loadLatestConversation();
        }
    }, [open, historyLoaded]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, open]);

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }

    async function handleSend() {
        const text = input.trim();

        if(!text || loading) return;

        const userMessage: AiChatMessage = {
            role: "USER",
            content: text,
        };

        setMessages((current) => [...current, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const res = await aiService.chat({
                message: text,
                conversationId,
            });

            setConversationId(res.data.conversationId);

            const assistantMessage: AiChatMessage = {
                role: "ASSISTANT",
                content: res.data.answer,
                suggestions: res.data.suggestions,
            };

            setMessages((current) => [...current, assistantMessage]);
        } catch(error) {
            console.error("Send AI chat message failed:", error);
            setMessages((current) => [
                ...current,
                {
                    role: "ASSISTANT",
                    content: "Xin lỗi, hiện tại mình chưa tư vấn được. Bạn thử lại sau nhé.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed bottom-5 right-5 z-50">
            {open ? (
                <div className="flex h-[min(620px,calc(100vh-40px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl border bg-white shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center justify-between bg-blue-700 px-4 py-3 text-white">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Bot className="h-5 w-5" />
                            Tư vấn mua hàng
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="rounded-full p-1 transition hover:bg-white/15"
                            aria-label="Đóng chat"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3">
                        {!historyLoaded ? (
                            <div className="rounded-lg bg-white p-3 text-center text-sm text-slate-500 shadow-sm">
                                Đang tải lịch sử...
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="rounded-lg bg-white p-3 text-sm leading-6 text-slate-700 shadow-sm">
                                Xin chào, mình có thể tư vấn sản phẩm phù hợp với nhu cầu và ngân sách của bạn.
                            </div>
                        ) : null}

                        {messages.map((item, index) => {
                            const isUser = item.role === "USER";

                            return (
                                <div
                                    key={`${item.messageId || index}-${item.role}`}
                                    className={isUser ? "flex flex-col items-end" : "flex flex-col items-start"}
                                >
                                    <div
                                        className={
                                            isUser
                                                ? "max-w-[85%] rounded-2xl rounded-br-sm bg-blue-700 px-3 py-2 text-left text-sm leading-6 text-white"
                                                : "max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-left text-sm leading-6 text-slate-800 shadow-sm"
                                        }
                                    >
                                        <p className="whitespace-pre-line break-words">{item.content}</p>
                                    </div>

                                    {!isUser && item.suggestions && item.suggestions.length > 0 && (
                                        <div className="mt-2 w-[85%] space-y-2">
                                            {item.suggestions.slice(0, 3).map((product, productIndex) => (
                                                <ProductSuggestionCard
                                                    key={`${product.productId}-${product.variantId}-${productIndex}`}
                                                    item={product}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {loading && (
                            <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-700" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-700 [animation-delay:120ms]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-blue-700 [animation-delay:240ms]" />
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>

                    <div className="flex gap-2 border-t bg-white p-3">
                        <input
                            value={input}
                            onChange={(event) => setInput(event.target.value)}
                            onKeyDown={(event) => {
                                if(event.key === "Enter") {
                                    event.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Nhập nhu cầu của bạn..."
                            className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-blue-600"
                        />

                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Gửi tin nhắn"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-end gap-3">
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className={[
                            "flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-700 shadow-xl ring-1 ring-blue-100 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-50",
                            showScrollTop
                                ? "pointer-events-auto translate-y-0 opacity-100"
                                : "pointer-events-none translate-y-3 opacity-0",
                        ].join(" ")}
                        aria-label="Lên đầu trang"
                    >
                        <ChevronUp className="h-6 w-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-700 text-white shadow-xl transition hover:-translate-y-1 hover:bg-blue-800"
                        aria-label="Mở chat tư vấn"
                    >
                        <Bot className="h-7 w-7" />
                    </button>
                </div>
            )}
        </div>
    );
}
