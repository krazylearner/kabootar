import mermaid from "https://unpkg.com/mermaid@11/dist/mermaid.esm.min.mjs";

const dark = () =>
  document.body.getAttribute("data-md-color-scheme") === "slate";

mermaid.initialize({
  startOnLoad: false,
  theme: dark() ? "dark" : "default",
  securityLevel: "loose",
});

document$.subscribe(() => {
  mermaid.run({ querySelector: ".mermaid" });
});
