const Path    = require('path')
const Webpack = require('webpack')
const rootDir = __dirname

const SHARED_STYLE_EXTENSIONS = ['style', 'css']

const inProd = process.env.NODE_ENV === 'production'

const plugins = [
  new Webpack.DefinePlugin({'process.env.LOG_LEVEL': JSON.stringify(process.env.LOG_LEVEL)}),
  new Webpack.optimize.OccurenceOrderPlugin()
]

const explodingTiles = [
  './new-school/index.js',
  './assets/css/index.css'
]

const hslWorker = [
  './new-school/workers/hsl.js'
]

if (!inProd) {
  plugins.push(
    new Webpack.NoErrorsPlugin(),
    new Webpack.HotModuleReplacementPlugin()
  )
  explodingTiles.push('webpack-hot-middleware/client')
  hslWorker.push('webpack-hot-middleware/client')
}

module.exports = {
  context: rootDir,
  devtool: '#eval-source-map',
  entry: {
    explodingTiles : explodingTiles,
    hslWorker      : hslWorker
  },
  output: {
    path: Path.join(rootDir, 'js'),
    filename: '[name].js',
    publicPath: '/js'
  },
  plugins: plugins,
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
}
