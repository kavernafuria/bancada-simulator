import React from "react";

export function ThemeScript() {
  const code = `
    (function() {
      try {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } catch (e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
