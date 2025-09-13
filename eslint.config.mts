import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { 
      globals: globals.browser,
    }
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  
  {
    files: ["**/*.{ts,mts,cts}"],
    rules: {
      quotes: ["error", "single", { avoidEscape: true }],
      semi: ["error", "always"],

      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports"
        }
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",

      "@typescript-eslint/no-unused-vars": [
        "error",
        { 
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-useless-constructor": "error",
      "@typescript-eslint/no-empty-function": ["error", { allow: ["constructors"] }],
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-magic-numbers": "off"
    }
  },
  {
    files: ["**/*.{test,spec}.{ts,mts,cts}"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-function": "off"
    }
  },
  {
    files: ["*.config.{js,ts,mjs,mts}", "eslint.config.{js,ts,mjs,mts}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off"
    }
  }
]);