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
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		compress: false,
		port: 9000
	},
	plugins: [
	],
	module: {
		rules: [
			{
				test: /\.(m?js|jsx)$/i,
				loader: 'babel-loader'
			},
			{
				test: /\.css$/i,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: 'asset'
			}
		]
	}
}