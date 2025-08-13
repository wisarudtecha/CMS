// /src/context/v2/ThemeContext.tsx
"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Theme, ThemeVariant, ThemeContextType } from "@/types/theme";

// type Theme = "light" | "dark";

// type ThemeContextType = {
//   theme: Theme;
//   toggleTheme: () => void;
// };

// Design token mappings based on your _variables.css
const themeVariants: Record<Theme, ThemeVariant> = {
  light: {
    primary: "var(--brand-mioc-primary-0, #0bcfce)",
    secondary: "var(--brand-mioc-secondary-0, #3bada9)",
    accent: "var(--brand-metthier-primary-0, #fd6e2b)",
    background: "var(--greyscale-white-0, #ffffff)",
    surface: "var(--tile-primary-background-default-0, #ffffff)",
    text: "var(--label-paragraph-0, #000000)",
    border: "var(--border-default, #e5ebf6)",
  },
  dark: {
    primary: "var(--brand-mioc-primary-0, #0bcfce)",
    secondary: "var(--brand-mioc-secondary-100, #114a50)",
    accent: "var(--brand-metthier-primary-100, #ff8311)",
    background: "var(--core-background-default-0, #15181c)",
    surface: "var(--modal-background-default-0, #114a50)",
    text: "var(--label-paragraph-0, #ffffff)",
    border: "var(--border-default, #0b0e14)",
  },
  mioc: {
    primary: "var(--brand-mioc-primary-0, #0bcfce)",
    secondary: "var(--brand-mioc-secondary-0, #3bada9)",
    accent: "var(--brand-mioc-primary-100, #00fff7)",
    background: "var(--brand-mioc-primary-200, #cbfffd)",
    surface: "var(--greyscale-white-0, #ffffff)",
    text: "var(--brand-mioc-secondary-100, #114a50)",
    border: "var(--brand-mioc-secondary-0, #3bada9)",
  },
  metthier: {
    primary: "var(--brand-metthier-primary-0, #fd6e2b)",
    secondary: "var(--brand-metthier-secondary-0, #473366)",
    accent: "var(--brand-metthier-primary-100, #ff8311)",
    background: "var(--greyscale-white-0, #ffffff)",
    surface: "var(--tile-primary-background-default-0, #ffffff)",
    text: "var(--brand-metthier-secondary-0, #473366)",
    border: "var(--brand-metthier-secondary-100, #6762c0)",
  },
};

// CSS class mappings for Tailwind integration
const themeClasses: Record<Theme, string> = {
  light: "theme-light",
  dark: "theme-dark dark",
  mioc: "theme-mioc",
  metthier: "theme-metthier",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // const [theme, setTheme] = useState<Theme>("light");
  const [theme, setThemeState] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoized theme variant
  const variant = useMemo(() => themeVariants[theme], [theme]);

  useEffect(() => {
    try {
      // This code will only run on the client side
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      // const initialTheme = savedTheme || "light"; // Default to light theme
      const initialTheme = savedTheme && Object.keys(themeVariants).includes(savedTheme) 
        ? savedTheme 
        : "light"; // Default to light theme
      // setTheme(initialTheme);
      setThemeState(initialTheme);
      // setIsInitialized(true);
    }
    catch (error) {
      console.warn("Failed to load theme from localStorage:", error);
      setThemeState("light");
    }
    finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    // if (isInitialized) {
    //   localStorage.setItem("theme", theme);
    //   if (theme === "dark") {
    //     document.documentElement.classList.add("dark");
    //   } else {
    //     document.documentElement.classList.remove("dark");
    //   }
    // }

    try {
      localStorage.setItem("cms-theme", theme);
      
      // Apply CSS classes to document
      const html = document.documentElement;
      
      // Remove all theme classes
      Object.values(themeClasses).forEach(className => {
        className.split(' ').forEach(cls => html.classList.remove(cls));
      });
      
      // Add current theme classes
      themeClasses[theme].split(' ').forEach(className => {
        html.classList.add(className);
      });

      // Apply CSS custom properties for runtime theming
      const root = document.documentElement.style;
      Object.entries(variant).forEach(([key, value]) => {
        root.setProperty(`--theme-${key}`, value);
      });
    }
    catch (error) {
      console.warn("Failed to apply theme:", error);
    }
  }, [
    theme,
    variant,
    isInitialized
  ]);

  const toggleTheme = () => {
    // setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    const themes: Theme[] = ["light", "dark", "mioc", "metthier"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeState(themes[nextIndex]);
  };

  const setTheme = (newTheme: Theme) => {
    if (Object.keys(themeVariants).includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const contextValue = useMemo(() => ({
    theme,
    variant,
    toggleTheme,
    setTheme,
    isInitialized,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [theme, variant, isInitialized]);

  return (
    <ThemeContext.Provider value={
      // { theme, toggleTheme }
      contextValue
    }>
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Helper hook for component styling
// eslint-disable-next-line react-refresh/only-export-components
export const useThemeStyles = () => {
  const { variant, theme } = useTheme();
  
  return {
    variant,
    theme,
    // Common style patterns for case management components
    cardStyles: {
      background: variant.surface,
      border: `1px solid ${variant.border}`,
      color: variant.text,
    },
    buttonPrimary: {
      background: variant.primary,
      color: variant.background,
      border: `1px solid ${variant.primary}`,
    },
    buttonSecondary: {
      background: variant.background,
      color: variant.primary,
      border: `1px solid ${variant.primary}`,
    },
    inputStyles: {
      background: variant.surface,
      border: `1px solid ${variant.border}`,
      color: variant.text,
    },
    // Status color mappings for case management
    statusColors: {
      success: "var(--status-success-0, #5dd597)",
      warning: "var(--status-warning-0, #ffa857)",
      error: "var(--status-error-0, #fa4e52)",
      info: "var(--status-info-0, #47bdff)",
      critical: "var(--status-critical-0, #7d4eff)",
      disabled: "var(--status-disabled-0, #8b9db3)",
    },
    // Priority color mappings for case priorities
    priorityColors: {
      high: "var(--status-high-0, #ff7c44)",
      critical: "var(--status-critical-0, #7d4eff)",
      normal: variant.primary,
      low: "var(--status-disabled-0, #8b9db3)",
    }
  };
};
