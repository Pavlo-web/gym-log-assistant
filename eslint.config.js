import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "server-only",
              message:
                "TanStack Start does not use the Next.js `server-only` package. Rename the module to `*.server.ts` or mark it with `@tanstack/react-start/server-only`.",
            },
          ],
        },
      ],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Own code only: the shadcn files in components/ui and the Lovable runtime files keep their style.
    files: ["src/**/*.{ts,tsx}"],
    ignores: [
      "src/components/ui/**",
      "src/routeTree.gen.ts",
      "src/hooks/use-mobile.tsx",
      "src/lib/utils.ts",
      "src/lib/error-capture.ts",
      "src/lib/error-page.ts",
      "src/lib/lovable-error-reporting.ts",
      "src/{router,server,start}.{ts,tsx}",
    ],
    rules: {
      // An arrow function is not hoisted, so it must be defined above its first use.
      "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
    },
  },
  {
    // No components here, so every function is an arrow function.
    files: ["src/{lib,data,hooks}/**/*.{ts,tsx}"],
    ignores: [
      "src/hooks/use-mobile.tsx",
      "src/lib/utils.ts",
      "src/lib/error-capture.ts",
      "src/lib/error-page.ts",
      "src/lib/lovable-error-reporting.ts",
    ],
    rules: { "func-style": ["error", "expression"] },
  },
  eslintPluginPrettier,
);
