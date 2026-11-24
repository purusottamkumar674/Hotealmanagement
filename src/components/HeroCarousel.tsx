"use client";
import type { Slide } from "@/lib/server/catalog";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState,useRef } from "react";
import { ImageCover } from "./Cards";
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const touch=useRef<{x:number;y:number}|null>(null);
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [focus, setFocus] = useState(false),
    [reduced, setReduced] = useState(true),
    [hidden, setHidden] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(m.matches),
      visibility = () => setHidden(document.hidden);
    change();
    visibility();
    m.addEventListener("change", change);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      m.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (slides.length < 2 || paused || focus || reduced || hidden)
      return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % slides.length),
      3000,
    );
    return () => clearInterval(id);
  }, [slides.length, paused, focus, reduced, hidden]);
  const current = slides[index % Math.max(1, slides.length)];
  const move = (offset: number) =>
    setIndex((i) => (i + offset + slides.length) % slides.length);
  return (
    <section
      className="home-hero live-hero"
      aria-roledescription="carousel"
      aria-label="Discover our properties"
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false);
      }}
      onKeyDown={(e) => {
        if (slides.length > 1 && e.target === e.currentTarget) {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          }
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          }
        }
      }}
      tabIndex={slides.length > 1 ? 0 : undefined}
      onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}}
      onTouchEnd={e=>{const start=touch.current;touch.current=null;if(!start||slides.length<2)return;const dx=e.changedTouches[0].clientX-start.x,dy=e.changedTouches[0].clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))move(dx>0?-1:1);}}
      onTouchCancel={()=>{touch.current=null;}}
    >
      {slides.map((slide, i) => (
        <div
          className={`hero-frame ${i === index % slides.length ? "visible" : ""}`}
          key={slide.id}
          aria-hidden={i !== index % slides.length}
        >
          <div className={slide.mobileImage ? "hero-desktop-image" : ""}>
            <ImageCover src={slide.image} alt={slide.alt} eager={i === 0} hotelId={slide.hotel}/>
          </div>
          {slide.mobileImage && (
            <div className="hero-mobile-image">
              <ImageCover
                src={slide.mobileImage}
                alt={slide.alt}
                eager={false}
                hotelId={slide.hotel}
              />
            </div>
          )}
        </div>
      ))}
      <div className="home-hero-shade" />
      <div className="container home-hero-content">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow">{current?.hotel==='flower-inn'?'THE FLOWER COLLECTION':current?.hotel==='petal-inn'?'THE PETAL COLLECTION':'FLOWER INN & PETAL INN'}</p>
          <h1 className="serif">
            {current?.heading || "Find your place to unwind."}
          </h1>
          <p>
            {current?.subtitle ||
              "Two properties. One place to explore your next stay."}
          </p>
          <div className="hero-actions"><Link
            href={current?.cta_link || "/hotels"}
            className="button button-cream"
          >
            {current?.cta_text || "Explore our properties"}
          </Link>
          <Link href={current?.hotel?`/hotels/${current.hotel}#rooms`:'/rooms'} className="button button-white-outline">Explore rooms</Link></div>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="carousel-controls" aria-label="Slideshow controls">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous slide"
          >
            <ChevronLeft />
          </button>
          <div className="carousel-dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`Show slide ${i + 1}: ${s.heading}`}
                aria-current={index % slides.length === i ? "true" : undefined}
                onClick={() => setIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => move(1)} aria-label="Next slide">
            <ChevronRight />
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            aria-pressed={paused}
          >
            {paused ? <Play /> : <Pause />}
          </button>
        </div>
      )}
    </section>
  );
}
