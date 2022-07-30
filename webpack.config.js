const path = require('path');

module.exports = {
	entry: './src/js/fmg.js',
	mode: 'production',
	output: {
		globalObject: 'this',
		filename: 'js/fmg.js',
		path: path.resolve(__dirname, 'dist'),
	},
	optimization: {
		minimize: true
	},
	target: ['web', 'es5'],
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
						plugins: ['@babel/plugin-transform-runtime']
					}
				}
			}
		]
	},
	experiments: {
		topLevelAwait: true
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		compress: true,
		port: 9000,
	}
}