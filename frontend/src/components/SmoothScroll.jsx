import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

export default function SmoothScroll() {
    const location = useLocation();
    const lenisRef = useRef(null);

    // Initialize high-performance Lenis scroll engine
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // smooth fast-to-slow exponential curve
            direction: "vertical",
            gestureDirection: "vertical",
            smooth: true,
            smoothTouch: false, // leave touch events native for optimal mobile responsiveness
            touchMultiplier: 1.5,
        });

        lenisRef.current = lenis;

        // High-frequency animation frame loop
        let rafId;
        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }
        rafId = requestAnimationFrame(raf);

        // Clean up on unmount
        return () => {
            lenis.destroy();
            cancelAnimationFrame(rafId);
        };
    }, []);

    // Perform instantaneous scroll reset to top on route change
    useEffect(() => {
        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

    // Handle high-fidelity anchor scroll integration
    useEffect(() => {
        const handleAnchorClick = (e) => {
            const target = e.target.closest("a[href^='#']");
            if (!target) return;
            
            const href = target.getAttribute("href");
            if (href === "#") return;
            
            try {
                const element = document.querySelector(href);
                if (element && lenisRef.current) {
                    e.preventDefault();
                    lenisRef.current.scrollTo(element, {
                        offset: -20, // offset slightly to account for the sticky navbar spacing
                        duration: 1.2,
                    });
                }
            } catch (err) {
                console.warn("Invalid selector for smooth scroll:", href, err);
            }
        };

        document.addEventListener("click", handleAnchorClick);
        return () => {
            document.removeEventListener("click", handleAnchorClick);
        };
    }, []);

    return null;
}

