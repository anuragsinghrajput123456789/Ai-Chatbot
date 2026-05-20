import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SmoothScroll() {
    const location = useLocation();

    // High-performance scroll to top on route change
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }, [location.pathname]);

    // Native, hardware-accelerated smooth scrolling for anchor links
    useEffect(() => {
        const handleAnchorClick = (e) => {
            const target = e.target.closest("a[href^='#']");
            if (!target) return;
            
            const href = target.getAttribute("href");
            if (href === "#") return;
            
            try {
                const element = document.querySelector(href);
                if (element) {
                    e.preventDefault();
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
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

