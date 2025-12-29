module.exports = {
  plugins: {
    'posthtml-include': {
      root: './src',
      encoding: 'utf-8',
      tag: 'include'
    }
  }
};