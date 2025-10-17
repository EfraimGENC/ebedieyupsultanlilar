/**
 * Composable to make external links in prose content open in new tab
 * @param selector - CSS selector for the content container (default: '.prose-content')
 */
export const useExternalLinks = (selector: string = ".prose-content") => {
  onMounted(() => {
    if (import.meta.client) {
      const container = document.querySelector(selector);
      if (container) {
        const links = container.querySelectorAll("a");
        links.forEach((link) => {
          const href = link.getAttribute("href");
          // Check if it's an external link (starts with http, https, or www)
          if (
            href &&
            (href.startsWith("http://") ||
              href.startsWith("https://") ||
              href.startsWith("www."))
          ) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");

            // Optional: Add an external link icon
            // link.classList.add('external-link')
          }
        });
      }
    }
  });
};
