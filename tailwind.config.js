const production = !process.env.ROLLUP_WATCH

module.exports = {
  future: {
    purgeLayersByDefault: true,
    removeDeprecatedGapUtilities: true
  },
  purge: {
    content: [
      './public/index.html',
      './src/**/*.svelte'
    ],
    enabled: production,
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
      },
      fontSize: {
        'xxs': '0.5rem'
      }
    },
  },
  variants: {
    extend: {
      borderWidth: ['even', 'odd'],
      backgroundColor: ['even', 'odd', 'active'],
      textColor: ['even', 'odd', 'active']
    },
  },
  plugins: [],
}
