import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { RECOMMENDED_RULES, TANSTACK_START_RULES } from "oxlint-plugin-react-doctor";
import { defineConfig } from "vite-plus";

const reactDoctorRules = {
  ...RECOMMENDED_RULES,
  ...TANSTACK_START_RULES,
};

// Cloudflare プラグインは vitest のサーバー環境 (resolve.external) と競合するため
// テスト実行時は外す
const isTest = process.env.VITEST === "true";

export default defineConfig({
  fmt: {
    ignorePatterns: ["**/routeTree.gen.ts"],
    sortImports: {
      partitionByComment: true,
    },
    sortPackageJson: {
      sortScripts: true,
    },
    sortTailwindcss: {
      functions: ["cn"],
    },
  },
  lint: {
    categories: {
      correctness: "error",
    },
    env: {
      browser: true,
      node: true,
    },
    ignorePatterns: ["**/routeTree.gen.ts"],
    jsPlugins: [{ name: "react-doctor", specifier: "oxlint-plugin-react-doctor" }],
    options: {
      denyWarnings: true,
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        files: ["src/router.tsx", "*.config.ts"],
        rules: {
          "no-default-export": "off",
        },
      },
      {
        files: ["src/routes/**"],
        rules: {
          "react-doctor/no-multi-comp": "off",
          "react-doctor/only-export-components": "off",
        },
      },
      {
        // commandfor/command/closedby は React 19.2 が未対応の標準 HTML 属性。
        // 小文字属性はそのまま DOM に渡るが react-doctor が未知 prop と誤検知する
        files: ["src/routes/open-ui.tsx"],
        rules: {
          "react-doctor/no-unknown-property": "off",
        },
      },
    ],
    plugins: ["react", "react-perf", "import", "jsx-a11y", "promise"],
    rules: {
      ...reactDoctorRules,
      "no-default-export": "error",
    },
  },
  staged: {
    "*.{js,jsx,ts,tsx,json,css}": "vp check --fix",
  },
  plugins: [
    tailwindcss(),
    ...(isTest ? [] : [cloudflare({ viteEnvironment: { name: "ssr" } })]),
    tanstackStart(),
    // react's vite plugin must come after start's vite plugin
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
