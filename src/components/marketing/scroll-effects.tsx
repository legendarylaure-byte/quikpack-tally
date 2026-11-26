"use client";

import { useEffect } from "react";

export function ScrollEffects() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const site = document.querySelector<HTMLElement>(".mk-site");
    site?.classList.add("is-loaded");
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduced) {
      for (const element of reveals) {
        element.classList.add("is-visible");
      }

      return () => {
        document.body.classList.remove("mk-dark-nav");
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const rect = entry.target.getBoundingClientRect();

          if (entry.intersectionRatio >= 0.15) {
            entry.target.classList.add("is-visible");
          } else if (rect.bottom < 0 || rect.top > window.innerHeight) {
            entry.target.classList.remove("is-visible");
          }
        }
      },
      { threshold: [0, 0.15, 0.6], rootMargin: "0px 0px -10% 0px" },
    );

    for (const element of reveals) {
      observer.observe(element);
    }

    const parallaxTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-speed]"),
    );
    let frame = 0;

    function tick() {
      const viewHeight = window.innerHeight;
      const probeY = viewHeight * 0.08;
      let dark = false;

      for (const section of Array.from(document.querySelectorAll<HTMLElement>("section[data-theme]"))) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom >= probeY) {
          dark = section.dataset.theme === "dark";
          break;
        }
      }
      document.body.classList.toggle("mk-dark-nav", dark);

      for (const element of parallaxTargets) {
        const section = element.closest("section");
        if (!section) continue;
        const progress = -section.getBoundingClientRect().top / viewHeight;
        const speed = Number(element.dataset.speed ?? 0);
        const rotation = Number(element.dataset.rot ?? 0);
        const y = progress * speed * viewHeight;
        const turn = progress * rotation;
        element.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${turn.toFixed(2)}deg)`;
      }

      frame = window.requestAnimationFrame(tick);
    }

    frame = window.requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      document.body.classList.remove("mk-dark-nav");
    };
  }, []);

  return null;
}
