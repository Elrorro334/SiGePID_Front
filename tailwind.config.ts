import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#14532d', hover: '#166534', light: '#dcfce7', content: '#ffffff' },
        secondary: { DEFAULT: '#1e3a8a', hover: '#1e40af', light: '#dbeafe', content: '#ffffff' },
        surface: { DEFAULT: '#ffffff', muted: '#f8fafc', border: '#e2e8f0' },
        content: { strong: '#0f172a', DEFAULT: '#334155', muted: '#64748b' },
        status: { success: '#10b981', warning: '#f59e0b', danger: '#ef4444', info: '#3b82f6' }
      },
    },
  },
  plugins: [],
};
export default config;
