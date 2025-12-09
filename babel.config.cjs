module.exports = {
  presets: [
    // Transpile modern JS for the Node.js environment
    ['@babel/preset-env', { targets: { node: 'current' } }],
    // Add Vue-specific Babel transforms
    '@vue/babel-preset-app',
  ],
};