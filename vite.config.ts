import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// Import Lingui plugin for i18n support
// import { lingui } from "@lingui/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // react({
    //   // Enable React Fast Refresh
    //   babel: {
    //     // Use the Lingui macro for automatic message extraction
    //     plugins: ["@lingui/babel-plugin-lingui-macro"],
    //   },
    // }),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
    // Add Lingui plugin for i18n support
    // lingui(),
  ],
  resolve: {
    alias: {
      // Use '@' as an alias for the 'src' directory
      '@': '/src',
    },
  },
  
  // assetsInclude: [
  //   '**/*.json'
  // ],
  // // Configure Lingui plugin for i18n
  // json: {
  //   // Enable JSON support for Lingui
  //   namedExports: false,
  //   // Do not stringify JSON files
  //   stringify: false,
  // },

  // build: {
  //   rollupOptions: {
  //     output: {
  //       manualChunks: {
  //         vendor: ['react', 'react-dom'],
  //         // arcgis: ['@arcgis/core'],
  //         // charts: ['recharts', 'd3']
  //       }
  //     }
  //   }
  // }
});
