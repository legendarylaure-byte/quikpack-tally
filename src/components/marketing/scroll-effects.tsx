"use client";

import { useEffect } from "react";

export function ScrollEffects() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const site = document.querySelector<HTMLElement>(".mk-site");
    site?.classList.add("is-loaded");
    const reveals = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );

    for (const element of reveals) {
      observer.observe(element);
    }

    if (reduced) {
      return () => {
        observer.disconnect();
        document.body.classList.remove("mk-dark-nav");
      };
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
