import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
      },
    },
  },
  html: {
    title: "自然资源标准知识库",
    favicon: './src/assets/icon.png',
    meta: {
      description: 'A LLM based knowledge base by GXRS',
    },
  }
});
