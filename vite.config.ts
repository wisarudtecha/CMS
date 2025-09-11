import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
// import path from "path";

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
      // Use "@" as an alias for the "src" directory
      "@": "/src",
    },
  },
  
  // assetsInclude: [
  //   "**/*.json"
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
  //         vendor: ["react", "react-dom"],
  //         // arcgis: ["@arcgis/core"],
  //         // charts: ["recharts", "d3"]
  //       }
  //     }
  //   }
  // }

  // CORS Solution: Proxy API requests to backend
  server: {
    port: 5173,
    host: true, // Allow external connections
    allowedHosts: [
      "cms.welcomedcc.com"
    ],
    // Proxy configuration to handle CORS
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy) => {
          // Log proxy requests for debugging
          proxy.on("error", (err) => {
            console.log("Proxy error:", err);
          });
          proxy.on("proxyReq", (_proxyReq, req) => {
            console.log("Proxying request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("Proxy response:", proxyRes.statusCode, req.url);
          });
        },
      },
      
      // WebSocket proxy
      "/ws": {
        target: "ws://localhost:8080",
        ws: true,
        changeOrigin: true,
      },
    },
  },
  
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router', 'react-router-dom'],
          'fullcalendar': [
            '@fullcalendar/core',
            '@fullcalendar/daygrid', 
            '@fullcalendar/interaction',
            '@fullcalendar/list',
            '@fullcalendar/react',
            '@fullcalendar/timegrid',
          ],
          'charts': ['apexcharts', 'react-apexcharts'],
          'maps': ['@react-jvectormap/core', '@react-jvectormap/world'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'dnd': [
            '@dnd-kit/core', '@dnd-kit/modifiers', 
            '@dnd-kit/sortable', '@dnd-kit/utilities',
            '@hello-pangea/dnd', 'react-dnd', 'react-dnd-html5-backend',
          ],
          'ui': [
            '@headlessui/react',
            '@radix-ui/react-avatar',
            '@radix-ui/react-dialog', 
            '@radix-ui/react-scroll-area',
          ],
          'icons': ['lucide', 'lucide-react'],
          'utils': ['flatpickr', 'react-grid-layout', 'axios', 'uuid'],
        },
      },
      onwarn(warning, warn) {
        // Suppress eval warnings from react-jvectormap
        if (warning.code === "EVAL" && warning.id?.includes("@react-jvectormap/core")) {
          return
        }
        warn(warning)
      },
    },
    minify: "terser",
    cssMinify: false,
    chunkSizeWarningLimit: 2000,
  },
  
  define: {
    // Define environment variables
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    __API_URL__: JSON.stringify(process.env.VITE_API_BASE_URL),
  },
});
