import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**", 
      "next-env.d.ts",
    ],
  },
];

// const eslintConfig = [
//   ...compat.extends("next/core-web-vitals", "next/typescript"),
//   {
//     env: {
//       browser: true, // 客户端环境
//       node: true,    // 服务端/构建环境
//       es2025: true,  // ES 版本统一
//     },
//     parserOptions: {
//       ecmaVersion: "latest",
//       sourceType: "module",
//       project: "./tsconfig.json", // 绑定 tsconfig，统一类型校验
//     },
//     rules: { /* 你的规则 */ },
//     ignores: [/* 忽略列表 */],
//   },
// ];
export default eslintConfig;
