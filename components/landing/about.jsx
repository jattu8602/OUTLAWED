"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

const TextReveal = () => {
  const ctaRef = useRef(null);
  const aboutRef = useRef(null);
  const animeTextContainersRef = useRef(null);

  useEffect(() => {
    // Cache DOM elements after mount
    ctaRef.current = document.querySelector(".cta");
    aboutRef.current = document.querySelector(".about");
    animeTextContainersRef.current = document.querySelectorAll(
      ".anime-text-container"
    );

    // Only run if DOM is ready and containers exist
    if (
      !animeTextContainersRef.current ||
      animeTextContainersRef.current.length === 0
    )
      return;

    // TEXT PROCESSING: Split text into word elements and highlight keywords
    const animeTextParagraphs = document.querySelectorAll(".anime-text p");
    const keywords = [
      'clat',
      'aspirants',
      'mock',
      'tests',
      'exam',
      'affordable',
      'analyze',
      'nlu',
    ]

    animeTextParagraphs.forEach((paragraph) => {
      const text = paragraph.textContent || "";
      const words = text.split(/\s+/);
      paragraph.innerHTML = "";
      words.forEach((word, i) => {
        if (word.trim()) {
          const wordContainer = document.createElement("div");
          wordContainer.className = "word";
          const wordText = document.createElement("span");
          wordText.textContent = word;
          const normalizedWord = word.toLowerCase().replace(/[.,!?;:]/g, "");
          if (keywords.includes(normalizedWord)) {
            wordContainer.classList.add("keyword-wrapper");
            wordText.classList.add("keyword", normalizedWord);
          }
          wordContainer.appendChild(wordText);
          paragraph.appendChild(wordContainer);
          if (i < words.length - 1) {
            paragraph.appendChild(document.createTextNode(" "));
          }
        }
      });
    });

    // ANIMATION CONFIGURATION
    const wordHighlightBgColor = "60, 60, 60";
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { y: "100%" });
    }

    // SCROLL TRIGGER SETUP
    animeTextContainersRef.current.forEach((container, index) => {
      const isMobile = window.innerWidth < 768;
      const scrollMultiplier = isMobile ? 2 : 4;
      ScrollTrigger.create({
        trigger: container,
        pin: container,
        start: "top top",
        end: `+=${window.innerHeight * scrollMultiplier}`,
        pinSpacing: true,
        markers: false,
        onUpdate: (self) => {
          const progress = self.progress;
          const words = Array.from(
            container.querySelectorAll(".anime-text .word")
          );
          const totalWords = words.length;
          const cta = ctaRef.current;

          // CTA below viewport during text reveal phase
          if (progress <= 0.7 && cta) {
            gsap.set(cta, { y: "100%" });
          }

          // WORD REVEAL ANIMATION (0% - 70%)
          if (progress <= 0.7) {
            const progressTarget = 0.7;
            const revealProgress = Math.min(1, progress / progressTarget);
            const overlapWords = isMobile ? 8 : 15;
            const totalAnimationLength = 1 + overlapWords / totalWords;
            words.forEach((word, index) => {
              const wordText = word.querySelector("span");
              const wordStart = index / totalWords;
              const wordEnd = wordStart + overlapWords / totalWords;
              const timelineScale =
                1 /
                Math.min(
                  totalAnimationLength,
                  1 + (totalWords - 1) / totalWords + overlapWords / totalWords
                );
              const adjustedStart = wordStart * timelineScale;
              const adjustedEnd = wordEnd * timelineScale;
              const duration = adjustedEnd - adjustedStart;
              const wordProgress =
                revealProgress <= adjustedStart
                  ? 0
                  : revealProgress >= adjustedEnd
                  ? 1
                  : (revealProgress - adjustedStart) / duration;
              (word).style.opacity = wordProgress.toString();
              const backgroundFadeStart =
                wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
              const backgroundOpacity = Math.max(0, 1 - backgroundFadeStart);
              (
                word
              ).style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;
              if (wordText) {
                const textRevealThreshold = 0.9;
                const textRevealProgress =
                  wordProgress >= textRevealThreshold
                    ? (wordProgress - textRevealThreshold) /
                      (1 - textRevealThreshold)
                    : 0;
                wordText.style.opacity = Math.pow(
                  textRevealProgress,
                  0.5
                ).toString();
              }
            });
          } else {
            // REVERSE ANIMATION (70% - 100%)
            const reverseProgress = (progress - 0.7) / 0.3;
            const reverseOverlapWords = isMobile ? 3 : 5;
            words.forEach((word, index) => {
              const wordText = word.querySelector("span");
              (word).style.opacity = "1";
              const targetTextOpacity = 1;
              const reverseWordStart = index / totalWords;
              const reverseWordEnd =
                reverseWordStart + reverseOverlapWords / totalWords;
              const reverseTimelineScale =
                1 /
                Math.max(
                  1,
                  (totalWords - 1) / totalWords +
                    reverseOverlapWords / totalWords
                );
              const reverseAdjustedStart =
                reverseWordStart * reverseTimelineScale;
              const reverseAdjustedEnd = reverseWordEnd * reverseTimelineScale;
              const reverseDuration = reverseAdjustedEnd - reverseAdjustedStart;
              const reverseWordProgress =
                reverseProgress <= reverseAdjustedStart
                  ? 0
                  : reverseProgress >= reverseAdjustedEnd
                  ? 1
                  : (reverseProgress - reverseAdjustedStart) / reverseDuration;
              if (wordText) {
                if (reverseWordProgress > 0) {
                  wordText.style.opacity = (
                    targetTextOpacity *
                    (1 - reverseWordProgress)
                  ).toString();
                  (
                    word
                  ).style.backgroundColor = `rgba(${wordHighlightBgColor}, ${reverseWordProgress})`;
                } else {
                  wordText.style.opacity = targetTextOpacity.toString();
                  (
                    word
                  ).style.backgroundColor = `rgba(${wordHighlightBgColor}, 0)`;
                }
              }
            });
            // CTA MOVEMENT - Move CTA div from below to center
            const cta = ctaRef.current;
            if (cta) {
              const startY = 100;
              const endY = 0;
              const currentY = startY + (endY - startY) * reverseProgress;
              gsap.set(cta, { y: `${currentY}%` });
            }
          }
        },
      });
    });

    // Cleanup: kill all ScrollTriggers
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <>
      <section
        ref={aboutRef}
        className="about anime-text-container bg-[#141414] text-black relative w-full h-full min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden"
      >
        <div className="w-full h-full flex flex-col justify-center items-center text-center rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl border border-dashed border-[rgb(60,60,60)] p-4 sm:p-6 md:p-8">
          <h1 className="text-white mb-2 sm:mb-8 md:mb-12 lg:mb-16 font-black leading-tight px-2 text-[clamp(1.5rem,2vw,1.6rem)] sm:text-[clamp(1.2rem,1.5vw,1.8rem)] md:text-[clamp(1.3rem,2.9vw,3.5rem)]">
            About{' '}
            <span className="inline-block px-2 sm:px-3 md:px-4 lg:px-6 bg-pink-300 rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-3xl border-2 sm:border-3 md:border-4 lg:border-6">
              Outlawed
            </span>
          </h1>
          <div className="text-white anime-text w-full max-w-[80vw] sm:max-w-[75vw] md:max-w-[65vw] lg:max-w-[50vw] xl:max-w-[55vw] space-y-3 sm:space-y-4 md:space-y-6 text-[0.3rem] sm:text-[clamp(0.5rem,1.2vw,0.85rem)] md:text-[clamp(0.6rem,1.4vw,0.95rem)] lg:text-[clamp(0.7rem,1.6vw,1.05rem)] xl:text-[clamp(0.8rem,1.8vw,1.4rem)]">
            <p className="text-center md:text-justify font-black leading-relaxed px-2 sm:px-8 md:px-12">
              Outlawed.in is a smart test-prep platform built exclusively for
              CLAT aspirants. Outlawed helps law students
              practice with expertly curated mock tests that match the exact
              CLAT exam pattern.
            </p>
            <p className="text-center md:text-justify font-black leading-relaxed px-2 sm:px-8 md:px-12">
              Our mission is to make CLAT preparation affordable, accessible,
              and exam-focused — so every aspirant can analyze performance
              deeply and improve faster. Whether starting out or aiming for a
              top rank, Outlawed.in is your trusted partner on the road to NLU
              success.
            </p>
          </div>
        </div>
        <div
          ref={ctaRef}
          className="absolute cta inset-0 w-full h-full overflow-hidden flex items-center justify-center"
        >
          <div className="w-full h-full mx-auto flex flex-col justify-center items-center text-center rounded-lg sm:rounded-xl md:rounded-2xl lg:rounded-xl bg-[#f9ffa5] p-4 sm:p-6 md:p-8">
            {/* Headline */}
            <h1 className="w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[90vw] text-[#141414] font-black leading-relaxed px-2 sm:px-4 mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-[clamp(1.8rem,3vw,3rem)] sm:text-[clamp(1.2rem,2vw,1.6rem)] md:text-[clamp(2.5rem,4vw,4.5rem)]">
              India’s Most Affordable CLAT Test Series 🚀
            </h1>

            {/* Stats Grid */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 text-[clamp(1.8rem,2vw,4.1rem)] sm:text-[clamp(1rem,1.8vw,1.3rem)] md:text-[clamp(1rem,1.7vw,2rem)] text-[#141414] mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <div className="flex flex-col items-center">
                <h2 className="font-black mb-2">5,000+</h2>
                <p className="font-medium">Aspirants Practicing</p>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="font-black mb-2">50+</h2>
                <p className="font-medium">Expertly Designed Mocks</p>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="font-black mb-2">₹99</h2>
                <p className="font-medium">Starting Price</p>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="font-black mb-2">Top 10</h2>
                <p className="font-medium">NLU Style Pattern</p>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="font-black mb-2">24/7</h2>
                <p className="font-medium">Smart Analysis Dashboard</p>
              </div>

              <div className="flex flex-col items-center">
                <h2 className="font-black mb-2">100%</h2>
                <p className="font-medium">Affordable & Accessible</p>
              </div>
            </div>

            {/* CTA Footer */}
            <div className="w-full text-center">
              <p className="text-[#141414] font-bold text-[clamp(1.3rem,3vw,2.6rem)] sm:text-[clamp(1.1rem,3.8vw,6.3rem)] md:text-[clamp(1.4rem,3.2vw,2rem)]">
                Start Your CLAT Journey with Outlawed.in 💡
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
};

export default TextReveal;
