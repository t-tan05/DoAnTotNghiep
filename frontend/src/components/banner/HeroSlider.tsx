import { useEffect, useState } from "react";
import { heroSlides } from "./hero-slider.data";
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
            <div className="relative mx-auto w-full max-w-7xl">
                <div className="relative h-[420px] overflow-hidden md:aspect-[16/9] md:h-auto lg:aspect-[2464/920] lg:rounded-xl">
                    {heroSlides.map((slide, index) => (
                        <div 
                            key={slide.id}
                            className={[
                                "absolute inset-0 transition-opacity duration-700",
                                index === currentIndex ? "opacity-100" : "pointer-events-none opacity-0",
                            ].join(" ")}
                        >
                            <picture className="block h-full w-full">
                                <source media="(max-width: 767px" srcSet={slide.image.mobile}/>
                                <source media="(max-width: 1023px" srcSet={slide.image.tablet}/>

                                <img src={slide.image.desktop} alt="Banner" className="h-full w-full object-cover"/>

                            </picture>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={goToPrevious}
                        className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white md:left-4 md:size-10 lg:size-11"
                        aria-label="Ảnh trước"
                    >
                        <ChevronLeft className="size-6" />
                    </button>

                    <button
                        type="button"
                        onClick={goToNext}
                        className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-foreground shadow transition hover:bg-white md:right-4 md:size-10 lg:size-11"
                        aria-label="Ảnh tiếp theo"
                    >
                        <ChevronRight className="size-6" />
                    </button>

                    <div className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 gap-2 md:flex">
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