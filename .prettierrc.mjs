// Prettier defaults on purpose: identical to format-on-save in the editor. Do not add options.
/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro"],
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};
