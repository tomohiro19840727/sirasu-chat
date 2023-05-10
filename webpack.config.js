const Dotenv = require('dotenv-webpack');

module.exports = {
  // ... 他の設定 ...
  plugins: [
    new Dotenv()
  ]
};
