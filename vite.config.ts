import { defineConfig } from "vite";
import { version } from "./package.json";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,

        // This will transform SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent"
      }
    })
  ],
  resolve: {
    alias: {
      // Use "@" as an alias for the "src" directory
      "@": "/src"
    }
  },

  // CORS Solution: Proxy API requests to backend
  server: {
    port: 5173,
    host: true, // Allow external connections
    allowedHosts: process.env.VITE_ALLOWED_HOSTS?.split(","),
    hmr: process.env.NODE_ENV === "production" ? {
      protocol: "wss", // Use "ws" if not serving over HTTPS
      host: process.env.VITE_HMR_HOST, // Public host browser is loading from
      clientPort: 443 // Needed if the browser connects over HTTPS
      // port: 5173 // If exposing the Vite port directly without proxy
    } : undefined,

    // Proxy configuration to handle CORS
    proxy: {
      "/api": {
        target: process.env.VITE_BASE_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        configure: (proxy) => {
          // Log proxy requests for debugging
          proxy.on("error", (err) => {
            console.error("Proxy error:", err);
          });
          proxy.on("proxyReq", (_proxyReq, req) => {
            console.log("Proxying request:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req) => {
            console.log("Proxy response:", proxyRes.statusCode, req.url);
          });
        }
      },

      // WebSocket proxy
      "/ws": {
        target: process.env.VITE_WEBSOCKET_BASE_URL,
        ws: true,
        changeOrigin: true
      }
    }
  },
  
  build: {
    chunkSizeWarningLimit: 2000,
    cssMinify: false,
    minify: "terser",
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "charts": [
            "apexcharts",
            "react-apexcharts"
          ],
          "dnd": [
            "@dnd-kit/core", "@dnd-kit/modifiers", 
            "@dnd-kit/sortable", "@dnd-kit/utilities",
            "@hello-pangea/dnd", "react-dnd", "react-dnd-html5-backend"
          ],
          "fullcalendar": [
            "@fullcalendar/core",
            "@fullcalendar/daygrid", 
            "@fullcalendar/interaction",
            "@fullcalendar/list",
            "@fullcalendar/react",
            "@fullcalendar/timegrid"
          ],
          "icons": [
            "lucide",
            "lucide-react"
          ],
          "maps": [
            "@react-jvectormap/core",
            "@react-jvectormap/world"
          ],
          "react-vendor": [
            "react",
            "react-dom"
          ],
          "redux": [
            "react-redux",
            "@reduxjs/toolkit"
          ],
          "router": [
            "react-router",
            "react-router-dom"
          ],
          "ui": [
            "@headlessui/react",
            "@radix-ui/react-avatar",
            "@radix-ui/react-dialog", 
            "@radix-ui/react-scroll-area"
          ],
          "utils": [
            "axios",
            "flatpickr",
            "react-grid-layout",
            "uuid"
          ]
        }
      },
      onwarn(warning, warn) {
        // Suppress eval warnings from react-jvectormap
        if (warning.code === "EVAL" && warning.id?.includes("@react-jvectormap/core")) {
          return
        }
        warn(warning)
      }
    }
  },
  
  define: {
    // Define environment variables
    __DEV__: JSON.stringify(process.env.NODE_ENV === "development"),
    __API_URL__: JSON.stringify(process.env.VITE_API_BASE_URL),
    __APP_VERSION__: JSON.stringify(version),
  }
});
