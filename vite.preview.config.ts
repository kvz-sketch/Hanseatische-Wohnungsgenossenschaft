import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Builds preview.html as one bundle with every asset inlined; the inline
// script then folds the JS and CSS into a single self-contained HTML file.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { 'import.meta.env.VITE_PREVIEW': JSON.stringify('1') },
  publicDir: false,
  build: {
    outDir: 'dist-preview',
    assetsInlineLimit: () => true,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      input: 'preview.html',
      output: { inlineDynamicImports: true },
    },
  },
})
