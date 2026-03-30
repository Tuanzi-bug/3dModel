import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#64748B',        // 工业灰
        accent: '#F97316',         // 安全橙
        'accent-hover': '#EA580C', // 安全橙 hover
      },
    },
  },
  plugins: [],
}

export default config
