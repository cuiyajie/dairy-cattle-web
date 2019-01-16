const resolve = require('path').resolve;
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');

const pkg = require('./package.json');

let theme = {};
if (pkg.theme && typeof(pkg.theme) === 'string') {
  let cfgPath = pkg.theme;
  // relative path
  if (cfgPath.charAt(0) === '.') {
    cfgPath = resolve(__dirname, cfgPath);
  }
  const getThemeConfig = require(cfgPath);
  theme = getThemeConfig();
} else if (pkg.theme && typeof(pkg.theme) === 'object') {
  theme = pkg.theme;
}

const webpackConfig = {
  entry: {
    'index': './src/index.tsx',
    'mobile.index': './src/mobile/index.tsx'
  },
  output: {
    filename: '[name].js',
  },
  devServer: { 
    inline: true
  },
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [  
      {
        test: /\.tsx?$/,
        use: [
          'babel-loader', 
          {
            loader: 'awesome-typescript-loader',
            options: { useBabel: true }
          }
        ]
      }, 
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [
          'style-loader',
          'css-loader',
          'less-loader', {
            loader: 'autoprefixer-loader',
            options: { browsers: 'last 5 versions' }
          }
        ]
      },
      {
        test: /\.less$/,
        include: /node_modules/,
        use: [{
          loader: 'css-loader',
          options: {
            sourceMap: true,
            localIdentName: '[local]___[hash:base64:5]'
          }
        }, {
          loader: 'autoprefixer-loader',
          options: { browsers: 'last 5 versions'} 
        }, {
          loader: 'less-loader',
          options: {
            sourceMap: true,
            modifyVars: theme
          }
        }]
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        use: [{
          loader: 'url-loader',
          options: { limit: 10 * 1024 }
        }]
      },
      {
        test: /static\/(.+?)$/,
        use: [{
          loader: 'file-loader',
          options: { name: 'state/[name].[ext]' }
        }]
      }
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    new BrowserSyncPlugin(
      {
        host: 'localhost',
        port: 3000,
        proxy: 'http://localhost:8000/'
      },
      {
        reload: false
      }
    )
  ]
};

module.exports = () => webpackConfig;







