const path = require('path');
const nano = require("cssnano");
const WebpackBar = require('webpackbar');

/* Used to generate html file from template */
const HtmlWebpackPlugin = require('html-webpack-plugin')

/* Used to minify the css after it has been written to its output file */
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

/* Used to ensure proper order of SCSS/CSS */
const StyleLintPlugin = require("stylelint-webpack-plugin");

module.exports = () => {

	return {
		entry: {
			main: "./src/index.jsx", // Entry point of where webpack should start from
		},
		output: {
			// output build file to /public folder and call the file bundle.js
			path: __dirname + "/public",
			filename: "[name].js"
		},
		module: {
			rules: [
				// lint all jsx files and then run babel on them before bundling
				{
					test: /\.jsx$/,
					exclude: /node_modules/,
					use: ["babel-loader", "eslint-loader"],
				},

				// use sass-loader, css-loader, and style-loader for all scss files
				// sass-loader - converts scss to css
				// css-loader - allows for using import or require statements in the jsx
				// style-loader - injects the css into the browser in a style tag
				{
					test: /\.scss$/,
					use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"]
				},

				{
					test: /\.css$/,
					use: ["style-loader", "css-loader", "postcss-loader"]
                },

                {
                    test: /\.(eot|svg|ttf|woff|woff2)$/,
                    loader: 'file-loader?name=/[name].[ext]'
                }
			]
		},

		mode: process.env.NODE_ENV || 'development',

		resolve: {
			extensions: ['*', '.js', 'jsx', '.css', '.scss', '.sass']
		},

		devServer: {
			historyApiFallback: true,
			contentBase: path.join(__dirname, './public'),
			proxy: {
				"/api": "http://localhost:3000",
				"/images": "http://localhost:3000"
			}
		},

		plugins: [
			new HtmlWebpackPlugin({
				template: 'HTMLTemplate.js',
				dest: 'index.html',
				inject: true,
				title: 'Samuel Bernheim - Software Engineer'
			}),

			// Optimizes css by minifying it and removing comments
			new OptimizeCssAssetsPlugin({
				cssProcessor: nano,
				cssProcessorOptions: {discardComments: {removeAll: true} },
				canPrint: true
			}),

			// CSS Linter based on rules set in the .stylelintrc file
			new StyleLintPlugin({
				configFile: "./.stylelintrc",
				files: "./src/**/*.scss"
			}),

			new WebpackBar(),
		],
		optimization: {
			runtimeChunk: 'single',
			splitChunks: {
				chunks: 'all',
				maxInitialRequests: Infinity,
				minSize: 0,
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/,
						name(module) {
							// get the name. E.g. node_modules/packageName/not/this/part.js
							// or node_modules/packageName
							const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

							// npm package names are URL-safe, but some servers don't like @ symbols
							return `npm.${packageName.replace('@', '')}`;
						},
					},
				},
			}
		}
	}
}
