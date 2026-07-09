import { useEffect, useMemo, useState } from "react";

import carousel1 from "../assets/carousel1.jpg";
import carousel2 from "../assets/carousel2.jpg";
import carousel3 from "../assets/carousel3.jpg";

const slidesData = [
  { id: "s1", img: carousel1, title: "Blockbuster Premieres", cta: "Book Now" },
  { id: "s2", img: carousel2, title: "New Releases Every Week", cta: "Explore" },
  { id: "s3", img: carousel3, title: "Best Seats. Best Deals.", cta: "Get Tickets" },
];

export default function MovieCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = useMemo(() => slidesData, []);

  const goTo = (idx) => {
    const n = slides.length;
    setActiveIndex(((idx % n) + n) % n);
  };

  // autoplay
  useEffect(() => {
    const t = window.setInterval(() => goTo(activeIndex + 1), 4200);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, slides.length]);

  // keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") goTo(activeIndex - 1);
      if (e.key === "ArrowRight") goTo(activeIndex + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, slides.length]);



  return (
    <section className="movieCarousel" aria-label="Movie banner carousel">
      <div className="movieCarousel__frame">
        {slides.map((s, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={s.id}
              className={`movieCarousel__slide ${isActive ? "is-active" : ""}`}
              aria-hidden={!isActive}
            >
              <img
                className="movieCarousel__img"
                src={s.img}
                alt={s.title}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                draggable={false}
              />


            </div>
          );
        })}

        <button
          type="button"
          className="movieCarousel__nav movieCarousel__nav--prev"
          aria-label="Previous slide"
          onClick={() => goTo(activeIndex - 1)}
        >
          ‹
        </button>
        <button
          type="button"
          className="movieCarousel__nav movieCarousel__nav--next"
          aria-label="Next slide"
          onClick={() => goTo(activeIndex + 1)}
        >
          ›
        </button>

        <div className="movieCarousel__indicators" role="tablist" aria-label="Slide indicators">
          {slides.map((s, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={s.id}
                type="button"
                className={`movieCarousel__dot ${isActive ? "is-active" : ""}`}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={isActive}
                onClick={() => goTo(i)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}



