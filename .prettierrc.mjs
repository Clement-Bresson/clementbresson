// Prettier defaults on purpose: the same result as format-on-save in an editor
// with no Prettier settings. The plugin is only what makes .astro files formattable.
/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};
