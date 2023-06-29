const path = require('path');
const express = require('express');

module.exports = (env) => {
	var e = {
		fmg: './src/js/fmg.js'
	}
	if (env && env.web)
		e.stats = './src/stats/js/main.js';
	return {
		entry: e,
		mode: 'production',
		output: {
			globalObject: 'this',
			filename: 'js/[name].js',
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
			client: {
				overlay: false,
			},
			compress: true,
			port: 9000,
			webSocketServer: 'ws',
			liveReload: true,
			setupMiddlewares: (middlewares, devServer) => {
				devServer.app.use('/', express.static(path.resolve(__dirname, 'dist')));
				return middlewares;
			},
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
					compiler.hooks.afterEmit.tap('client', () => {
						var fs = require('fs'), file, client = env && env.client && !isNaN(env.client) ? env.client : '1';
						var props = JSON.parse(fs.readFileSync('clients/' + client + '/props.json', 'utf8'));
						fs.mkdirSync('dist/audio');
						fs.mkdirSync('dist/css');
						fs.mkdirSync('dist/font');
						fs.mkdirSync('dist/images');
						fs.mkdirSync('dist/js/lang');
						fs.cpSync('src/audio/', 'dist/audio', { recursive: true });
						fs.cpSync('src/font/', 'dist/font', { recursive: true });
						fs.cpSync('src/images/', 'dist/images', { recursive: true });
						fs.cpSync('src/js/lang/', 'dist/js/lang', { recursive: true });
						fs.cpSync('src/logoutcallback.html', 'dist/logoutcallback.html');
						fs.cpSync('src/oauthcallback.html', 'dist/oauthcallback.html');
						if (fs.existsSync('clients/' + client + '/images/favicon.ico'))
							fs.cpSync('clients/' + client + '/images/favicon.ico', 'dist/favicon.ico');
						file = '/css/style.css';
						var bundleId = client == 1 ? 'com.jq.spontifyme' : 'com.jq.fanclub.client' + client;
						fs.writeFileSync('dist' + file, fs.readFileSync('clients/' + client + '/style.css', 'utf8') + '\n\n' + fs.readFileSync('src' + file, 'utf8'));
						fs.writeFileSync('dist/index.html', fs.readFileSync('src/index.html', 'utf8')
							.replace(/\{placeholderAppleId}/g, props.appleId)
							.replace(/\{placeholderEmail}/g, props.email)
							.replace(/\{placeholderName}/g, props.name)
							.replace(/\{placeholderUrl}/g, props.url)
							.replace(/\{placeholderBundleID}/g, bundleId)
							.replace(/\{placeholderHost}/g, props.url.substring(8))
							.replace(/\{placeholderSchema}/g, props.url.substring(8, props.url.lastIndexOf('.'))));
						file = 'dist/js/fmg.js';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
							.replace('{placeholderAppTitle}', props.name)
							.replace('{placeholderClientId}', '' + Math.max(parseInt(client), 1))
							.replace('{placeholderServer}', props.server)
							.replace(/\{placeholderBundleID}/g, bundleId)
							.replace(/\{placeholderAppleID}/g, props.appleId));
						file = 'dist/js/stats.js';
						if (fs.existsSync(file)) {
							fs.cpSync('src/stats/stats.html', 'dist/stats.html');
							fs.cpSync('src/stats/css/stats.css', 'dist/css/stats.css');
							fs.cpSync('src/stats/images/', 'dist/images', { recursive: true });
							fs.cpSync('src/stats/js/lang/', 'dist/js/lang', { recursive: true });
							fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
								.replace('{placeholderAppTitle}', props.name)
								.replace('{placeholderClientId}', '' + Math.max(parseInt(client), 1))
								.replace('{placeholderServer}', props.server)
								.replace(/\{placeholderBundleID}/g, bundleId)
								.replace(/\{placeholderAppleID}/g, props.appleId));
						}
						file = 'dist/js/lang/DE.html';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
							.replace(/\{placeholderAppTitle}/g, props.name));
						file = 'dist/js/lang/EN.html';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
							.replace(/\{placeholderAppTitle}/g, props.name));
						file = 'dist/js/lang/DE.json';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
							.replace(/\${buddy}/g, props.de.buddy).replace(/\${buddies}/g, props.de.buddies));
						file = 'dist/js/lang/EN.json';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
							.replace(/\${buddy}/g, props.en.buddy).replace(/\${buddies}/g, props.en.buddies));
						file = '../appClient/config.xml';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
							.replace(/(<widget id=")([^"]+)/, '$1com.jq.fanclub.client' + client)
							.replace(/(<description\>)([^<]+)/, '$1' + props.name)
							.replace(/(<host scheme="https" name=")([^"]+)/g, '$1' + props.url.substring(8))
							.replace(/(<host name="" event="fb" scheme=")([^"]+)/g, '$1' + props.url.substring(8, props.url.lastIndexOf('.'))));
						file = 'dist/images/logo.svg';
						var s = fs.readFileSync(file, 'utf8')
							.replace('{placeholderAppTitle}', props.name.indexOf(' · ') > -1 ? props.name.substring(props.name.indexOf(' · ') + 3) : props.name);
						if (fs.existsSync('clients/' + client + '/images/logo.png')) {
							fs.writeFileSync('dist/images/logo.png', fs.readFileSync('clients/' + client + '/images/logo.png'));
							s = s.replace('<image', '<image href="/images/logo.png"');
						}
						fs.writeFileSync(file, s);
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