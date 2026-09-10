import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: false,
      // Supabase クライアントはテストではモックするが、モジュール読み込み時の env チェックを通すためダミーを入れる
      env: { VITE_SUPABASE_URL: "http://localhost", VITE_SUPABASE_ANON_KEY: "test" },
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/app/**", "src/repositories/**"],
        // Figma Make 同梱で未使用の shadcn/ui 一式は対象外
        exclude: ["src/app/components/ui/**", "src/app/components/figma/**"],
      },
    },
  }),
);
