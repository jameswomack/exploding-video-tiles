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
      include: [
        Path.join(rootDir, 'js')
      ],
      cacheDirectory: true,
      loader: 'babel'
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

// Babel loader babelrc-like options
config.module.loaders[0].query = {
  plugins : [[
    'react-transform', {
      transforms: [{
        transform : 'react-transform-hmr',
        imports   : ['react'],
        locals    : ['module']
      }, {
        transform : 'react-transform-catch-errors',
        imports   : [
          'react',
          'redbox-react'
        ]
      }]
    }
  ]]
};

module.exports = config;
