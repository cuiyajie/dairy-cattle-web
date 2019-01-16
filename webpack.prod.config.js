var path = require('path')
var webpack = require('webpack')
var merge = require('webpack-merge')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')
var ProgressBarPlugin = require('progress-bar-webpack-plugin')

const pkg = require('./package.json');

let theme = {};
if (pkg.theme && typeof(pkg.theme) === 'string') {
  let cfgPath = pkg.theme;
  // relative path
  if (cfgPath.charAt(0) === '.') {
    cfgPath = path.resolve(__dirname, cfgPath);
  }
  const getThemeConfig = require(cfgPath);
  theme = getThemeConfig();
} else if (pkg.theme && typeof(pkg.theme) === 'object') {
  theme = pkg.theme;
}

module.exports = {
    entry: {
        'index': './src/index.tsx',
        'mobile.index': './src/mobile/index.tsx'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: './js/[name].[chunkhash].js',
        chunkFilename: './js/[id].[chunkhash].js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    'babel-loader',
                    {
                        loader: 'awesome-typescript-loader',
                        options: {
                            useBabel: true
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true
                            }
                        },
                        'less-loader',
                        {
                            loader: 'autoprefixer-loader',
                            options: {
                                browsers: 'last 5 versions'
                            }
                        }
                    ]
                })
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10 * 1024,
                        name: '/img/[name].[hash:7].[ext]'
                    }
                }]
            },
            {
                test: /static\/(.+?)$/,
                loader: 'file-loader?name=static/[name].[ext]'
            }
        ],
    },
    plugins: [
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new CleanWebpackPlugin(['dist'], { root: path.resolve(__dirname) }),
        new webpack.DefinePlugin({
            'process.env': { 
                NODE_ENV: JSON.stringify(process.env.NODE_ENV) 
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
        // extract css into its own file
        new ExtractTextPlugin('./css/[name].[contenthash].css'),
        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            favicon: './favicon.png',
            filename: path.resolve(__dirname, './dist/index.html'),
            template: 'index_dist.html',
            inject: true,
            chunks: ['index'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        new HtmlWebpackPlugin({
            favicon: './favicon.png',
            filename: path.resolve(__dirname, './dist/mobile/index.html'),
            template: 'mobile/index_dist.html',
            inject: true,
            chunks: ['mobile.index'],
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),
        // split vendor js into its own file
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'vendor',
        //     minChunks: function (module, count) {
        //         // any required modules inside node_modules are extracted to vendor
        //         return (
        //             module.resource &&
        //             /\.js$/.test(module.resource) &&
        //             module.resource.indexOf(
        //                 path.join(__dirname, 'node_modules')
        //             ) === 0
        //         )
        //     }
        // }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        new webpack.optimize.CommonsChunkPlugin({
            name: 'manifest',
            chunks: ['vendor']
        }),
        new CopyWebpackPlugin([{ 
            context: './lib',
            from: '**/*', 
            to: path.resolve(__dirname, 'dist/lib'),
            toType: 'dir'
        }]),
        new ProgressBarPlugin()
    ]
};

