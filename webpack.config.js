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
			directory: path.join(__dirname, 'dist')
		},
		compress: false,
		port: 9000
	},
	plugins: [
		{
			apply: compiler => {
				compiler.hooks.beforeCompile.tap('webCalls', () => {
					var method = function (s) {
						var i = s.lastIndexOf('static');
						var s2 = s.substring(i + 6, s.indexOf('{', i)).trim();
						if (s2.indexOf(' =') > 0) {
							s2 = s2.substring(0, s2.indexOf(' =')) + '.';
							s = s.substring(i + 6);
							i = s.lastIndexOf('},\n');
							if (i < 0)
								i = s.indexOf(' {\n');
							i += 3;
							s2 += s.substring(i, s.indexOf('{', i)).trim();
						}
						return s2.replace(/ /g, '');
					}
					var fs = require('fs'), dir = 'src/js/';
					var files = fs.readdirSync(dir);
					for (var i = 0; i < files.length; i++) {
						if (files[i].indexOf('.js') > 0) {
							var i2 = 0, s = fs.readFileSync(dir + files[i], 'utf8');
							while ((i2 = s.indexOf('webCall: \'', i2)) > -1) {
								var s2 = files[i].substring(0, files[i].length - 3) + '.' + method(s.substring(0, i2));
								i2 += 10;
								s = s.substring(0, i2) + s2 + s.substring(s.indexOf('\',', i2));
								i2 += s2.length;
							}
							fs.writeFileSync(dir + files[i], s);
						}
					}
				});
			}
		}
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