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
				compiler.hooks.afterEmit.tap('webCalls', () => {
					var fs = require('fs'), dir = 'src/js/';
					var files = fs.readdirSync(dir);
					var map = [];
					var method = function (s) {
						var i = s.indexOf('method:');
						if (i > 0) {
							s = s.substring(i + 7, s.indexOf(',', i)).replace(/'/g, '').trim();
							return s.indexOf('?') > -1 ? s.substring(s.indexOf('?') + 1).trim().replace(' : ', '|') : s;
						}
						return 'GET';
					}
					var body = function (s) {
						var i = s.indexOf('body: {');
						if (i > -1) {
							var i2 = s.indexOf('},', i);
							if (i2 < 0)
								i2 = s.lastIndexOf('}\n');
							return s.substring(i + 5, i2 + 1).replace(/\n/g, '').replace(/\t/g, '').replace(/ /g, '').trim();
						}
					}
					var call = function (s) {
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
						return s2;
					}
					var ajax = function (s) {
						var i2 = 0, e;
						while ((i2 = s.indexOf('communication.ajax', i2)) > -1) {
							e = {
								url: s.substring(s.indexOf('url:', i2) + 4, s.indexOf(',\n', i2)).replace('global.server +', '').replace(/'/g, '').trim(),
								body: body(s.substring(i2, s.indexOf('});', i2))),
								call: files[i].substring(0, files[i].length - 3) + '.' + call(s.substring(0, i2))
							}
							if (e.call.indexOf('lists.loadList(') != 0) {
								var s2 = method(s.substring(i2, s.indexOf('});', i2))).split('|');
								for (var i3 = 0; i3 < s2.length; i3++) {
									var e2 = JSON.parse(JSON.stringify(e));
									e2.url = s2[i3] + ' ' + e.url;
									map.push(e2);
								}
							}
							i2++;
						}
					}
					var lists = function (s) {
						var i2 = 0, e;
						while ((i2 = s.indexOf('lists.loadList', i2)) > -1) {
							e = {
								url: 'GET db/list?' + s.substring(i2 + 16, s.indexOf(',', i2)).replace(/'/g, '').trim(),
								call: files[i].substring(0, files[i].length - 3) + '.' + call(s.substring(0, i2))
							}
							map.push(e);
							i2++;
						}
					}
					var user = function (s) {
						var i2 = 0, e, b;
						while ((i2 = s.indexOf('user.save', i2)) > -1) {
							b = s.substring(i2 + 10);
							if (b.indexOf('{') == 0)
								b = body('body: ' + b.substring(0, b.indexOf('}')) + ',classname:\'Contact\'},');
							else
								b = b.substring(0, b.indexOf(')'));
							console.log(b);
							e = {
								url: 'PUT db/one',
								body: b,
								call: files[i].substring(0, files[i].length - 3) + '.' + call(s.substring(0, i2))
							}
							map.push(e);
							i2++;
						}
					}
					for (var i = 0; i < files.length; i++) {
						if (files[i].indexOf('.js') > 0) {
							var s = fs.readFileSync(dir + files[i], 'utf8');
							ajax(s);
							lists(s);
							user(s);
						}
					}
					fs.writeFileSync('../api/src/main/resources/webCalls.json', JSON.stringify(map));
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