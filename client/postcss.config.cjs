// client/postcss.config.cjs
module.exports = {
  plugins: {
    // FIX: Usamos o nome do novo pacote de plugin oficial
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};