const path = require('path');

module.exports = (env) => {
	return {
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
			port: 9000,
			devMiddleware: {
				writeToDisk: true
			}
		},
		watchOptions: {
			poll: 999999999
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
						if (fs.existsSync('dist'))
							fs.rmSync('dist', { recursive: true });
						var files = fs.readdirSync(dir);
						for (var i = 0; i < files.length; i++) {
							if (files[i].indexOf('.js') > 0) {
								var i2 = 0, s = fs.readFileSync(dir + files[i], 'utf8');
								while ((i2 = s.indexOf('webCall: \'', i2)) > -1) {
									i2 += 10;
									s = s.substring(0, i2) + files[i].substring(0, files[i].length - 3) + '.' + method(s.substring(0, i2)) + s.substring(s.indexOf('\',', i2));
								}
								fs.writeFileSync(dir + files[i], s);
							}
						}
					})
				}
			},
			{
				apply: compiler => {
					compiler.hooks.afterEmit.tap('custom', () => {
						var fs = require('fs'), file = '/css/style.css', client = env && env.client && env.client.indexOf('0') == 0 ? env.client : '000001';
						for (var i = client.length; i < 6; i++)
							client = '0' + client;
						var props = JSON.parse(fs.readFileSync('clients/' + client + '/props.json', 'utf8'));
						fs.mkdirSync('dist/css');
						fs.mkdirSync('dist/js/lang');
						fs.mkdirSync('dist/font');
						fs.mkdirSync('dist/images');
						fs.cpSync('src/js/lang/', 'dist/js/lang', { recursive: true });
						fs.cpSync('src/font/', 'dist/font', { recursive: true });
						fs.cpSync('src/images/', 'dist/images', { recursive: true });
						fs.cpSync('src/index.html', 'dist/index.html');
						fs.cpSync('src/logoutcallback.html', 'dist/logoutcallback.html');
						fs.cpSync('src/oauthcallback.html', 'dist/oauthcallback.html');
						fs.cpSync('src/favicon.ico', 'dist/favicon.ico');
						fs.writeFileSync('dist' + file, props.css + '\n\n' + fs.readFileSync('src' + file, 'utf8'));
						file = 'dist/js/fmg.js';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('{placeholderAppTitle}', props.name).replace('{placeholderClient}', client));
						if (fs.existsSync('clients/' + client + '/images/logo.png')) {
							fs.writeFileSync('dist/images/logo.png', fs.readFileSync('clients/' + client + '/images/logo.png'));
							file = 'dist/images/logo.svg';
							fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('<g>', '<g class="image">').replace('<image', '<image href="images/logo.png"'));
						}
					})
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
}