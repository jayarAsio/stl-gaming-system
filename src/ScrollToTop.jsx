import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ScrollToTop: when the location changes, scroll to the top of the page.
// If the URL contains a hash (e.g. #section) attempt to scroll to that element.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Wait for the browser to layout new content
    requestAnimationFrame(() => {
      if (hash) {
        // Try to find the element by id matching the hash (without the #)
        const id = hash.replace(/^#/, "");
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "auto", block: "start" });
          return;
        }
        // If not found, fallthrough to scroll to top
      }

      // Default behavior: scroll to top-left
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }, [pathname, hash]);

  return null;
}
