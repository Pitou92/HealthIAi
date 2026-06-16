/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // HealthIAi SP palette — mapped to Tailwind tokens
        bg:           '#111827',
        'bg-card':    '#1F2937',
        'bg-input':   '#374151',
        primary:      '#22C55E',
        'primary-d':  '#16A34A',
        secondary:    '#3B82F6',
        fg:           '#F9FAFB',
        'fg-dim':     '#D1D5DB',
        muted:        '#9CA3AF',
        purple:       '#A78BFA',
        danger:       '#F87171',
      },
    },
  },
  plugins: [],
};
