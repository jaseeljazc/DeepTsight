import nextConfig from "eslint-config-next";

// ARCHITECTURE.md §4.2: nothing outside src/content/ may import from src/content/source/.
const contentSourcePattern = {
  group: ["@/content/source/*", "**/content/source/*"],
  message:
    "Importing from content/source is forbidden outside src/content. Read all content via the adapter @/content.",
};

// The CMS stays behind the content seam: Payload is imported only from src/content, src/cms,
// the (payload) route group, the Payload config, scripts/cms and tests (docs/cms/01_BUILD_PLAN.md).
const payloadPattern = {
  group: ["payload", "payload/*", "@payload-config", "@payloadcms/*"],
  message:
    "Payload may only be imported from src/content, src/cms, src/app/(payload) and src/payload.config.ts. Read content via the adapter @/content.",
};

const eslintConfig = [
  ...nextConfig,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Principle 5 & 7: TypeScript strictness
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-nocheck": true,
        },
      ],

      // ARCHITECTURE.md §4.2: Seam enforcement
      // Nothing outside src/content/ may import from src/content/source/
      "no-restricted-imports": ["error", { patterns: [contentSourcePattern, payloadPattern] }],

      // ARCHITECTURE.md §7: Design system enforcement
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/#([0-9a-fA-F]{3,8})/]",
          message:
            "Raw hex colors are forbidden in JSX className. Use design system tokens from globals.css.",
        },
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/rounded-(sm|md|lg|xl|2xl|3xl)/]",
          message:
            "Arbitrary radii are forbidden. Use rounded-control (2px) or rounded-panel (4px) only.",
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/(p|m|gap)-\\[\\d+px\\]/]",
          message: "Arbitrary pixel spacing is forbidden. Use the approved 4px scale.",
        },
        // globals.css is the single source of truth: no arbitrary values (w-[12px], top-[calc(..)],
        // max-w-[40ch], min-[400px]:...) in class strings, including inside cn() and cva().
        {
          selector:
            "JSXAttribute[name.name='className'] Literal[value=/(^|[\\s:])!?-?[a-z][a-z0-9-]*-\\[/]",
          message:
            "Arbitrary values are forbidden. Add a token to src/styles/globals.css and use its utility instead.",
        },
        {
          selector:
            "CallExpression[callee.name=/^(cn|cva)$/] Literal[value=/(^|[\\s:])!?-?[a-z][a-z0-9-]*-\\[/]",
          message:
            "Arbitrary values are forbidden. Add a token to src/styles/globals.css and use its utility instead.",
        },
        {
          selector:
            "CallExpression[callee.name=/^(cn|cva)$/] Literal[value=/#([0-9a-fA-F]{3,8})\\b/]",
          message: "Raw hex colours are forbidden. Use a colour token from globals.css.",
        },
        {
          selector: "JSXAttribute[name.name='style'] Literal[value=/#([0-9a-fA-F]{3,8})\\b/]",
          message:
            "Raw hex colours are forbidden. Use a colour token (colorTokens where CSS cannot reach).",
        },
        {
          selector: "JSXAttribute[name.name='strokeWidth']",
          message:
            "Icon stroke comes from --icon-stroke in globals.css. Remove the strokeWidth prop.",
        },
      ],
    },
  },
  {
    // CMS code may use Payload, but still reads content only through the adapter.
    files: ["src/cms/**/*.{ts,tsx}", "src/app/(payload)/**/*.{ts,tsx}", "src/payload.config.ts"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [contentSourcePattern] }],
    },
  },
  {
    // Allow src/content/ to import from its internal source/ folder
    files: ["src/content/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    // Ignore build, coverage, and scripts from strict JSX lint rules
    ignores: [".next/**", "out/**", "build/**", "node_modules/**", "scripts/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
