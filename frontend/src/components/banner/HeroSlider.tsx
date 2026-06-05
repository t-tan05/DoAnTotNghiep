import { useEffect, useState } from "react";
import { heroSlides } from "./hero-slider.data";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AUTO_PLAY_DELAY = 4000;

export default function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    function goToPrevious(){
        setCurrentIndex((prev) => prev === 0 ? heroSlides.length - 1 : prev - 1);
    }

    function goToNext(){
        setCurrentIndex((prev) => prev === heroSlides.length - 1 ? 0 : prev + 1);
    }

    function goToSlide(index: number) {
        setCurrentIndex(index);
    }

    useEffect(() => {
        const timer = window.setInterval(() => {
            goToNext();
        }, AUTO_PLAY_DELAY);

        return () => {
            window.clearInterval(timer);
        };
    }, []);

    return(
        <section className="relative overflow-hidden bg-white">
            <div className="relative mx-auto max-w-7xl">
                <div className="relative aspect-[2464/920] overflow-hidden rounded-none md:rounded-xl">
                    {heroSlides.map((slide, index) => (
                        <div 
                            key={slide.id}
                            className={[
                                "absolute inset-0 transition-opacity duration-700",
                                index === currentIndex ? "opacity-100" : "pointer-events-none opacity-0",
                            ].join(" ")}
                        >
                            <img src={slide.image} alt="Banner" className="h-full w-full object-cover"/>

                            <div className="absolute inset-0 flex items-center">
                                <div className="max-w-xl px-8 text-white md:px-12">
                                    <Button>
                                        <Link to={slide.href} >Xem sản phẩm</Link>
                                    </Button>
                                </div>
                            </div>
                            
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white cursor-pointer"
                        aria-label="Ảnh trước"
                    >
                        <ChevronLeft className="size-6" />
                    </button>

                    <button
                        type="button"
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white cursor-pointer"
                        aria-label="Ảnh tiếp theo"
                    >
                        <ChevronRight className="size-6" />
                    </button>

                    <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                        {heroSlides.map((slide, index) => (
                            <button
                                key={slide.id}
                                type="button"
                                onClick={() => goToSlide(index)}
                                className={[
                                    "h-2.5 rounded-full transition-all cursor-pointer",
                                    index === currentIndex ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/80",
                                ].join(" ")}
                                aria-label={`Chuyển tới banner ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}