const Path    = require('path')
const Webpack = require('webpack')
const rootDir = __dirname

const SHARED_STYLE_EXTENSIONS = ['style', 'css']

const config = {
  context: rootDir,
  devtool: '#eval-source-map',
  entry: {
    explodingTiles : [
      './src/index.js',
      './css/index.css',
      'webpack-hot-middleware/client'
    ]
  },
  output: {
    path: Path.join(rootDir, 'build/js'),
    filename: '[name].min.js',
    publicPath: '/js'
  },
  plugins: [
    new Webpack.DefinePlugin({'process.env.LOG_LEVEL': JSON.stringify(process.env.LOG_LEVEL)}),
    new Webpack.optimize.OccurenceOrderPlugin(),
    new Webpack.NoErrorsPlugin(),
    new Webpack.HotModuleReplacementPlugin()
  ],
  resolve: {
    extensions: ['', '.js'],
    modulesDirectories: ['node_modules'],
    alias: { },
    fallback: Path.join(__dirname, '..', 'node_modules')
  },
  resolveLoader: { fallback: Path.join(__dirname, '..', 'node_modules') },
  eslint: {
    configFile: Path.join(rootDir, '.eslintrc')
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /\.css$/,
      loaders: SHARED_STYLE_EXTENSIONS
    }]
  },
  node: {
    // http://stackoverflow.com/questions/25553868/current-file-path-in-Webpack
    __filename : true,
    fs         : 'empty'
  }
};

module.exports = config;
