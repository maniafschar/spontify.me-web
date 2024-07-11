const path = require('path');
const express = require('express');

module.exports = (env) => {
	var e = {
		init: './src/js/init.js'
	}
	return {
		entry: e,
		mode: 'production',
		output: {
			globalObject: 'this',
			filename: 'js/[name].js',
			path: path.resolve(__dirname, 'dist'),
		},
		optimization: {
			minimize: env.debug ? false : true
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
			hot: false,
			liveReload: false,
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
							var i = s.length;
							while ((i = s.lastIndexOf(') {', i - 1)) > -1) {
								var line = s.substring(s.lastIndexOf('\n', i) + 1, i);
								if (line.charAt(2) != '\t' && line.indexOf('function (') < 0) {
									var func = line.substring(0, line.indexOf('(')).replace('static ', '');
									if (func && func.indexOf(' ') < 0) {
										var middle = '';
										if (line.charAt(1) == '\t') {
											var i2 = i;
											while ((i2 = s.lastIndexOf(' = {', i2 - 1)) > -1) {
												var s3 = s.substring(s.lastIndexOf('\n', i2) + 1, i2);
												if (s3.indexOf('\tstatic ') == 0) {
													middle = s3.trim().replace('static ', '') + '.';
													break;
												}
											}
										}
										return middle + func.trim();
									}
								}
							}
						};
						var fs = require('fs'), dir = 'src/js/';
						if (fs.existsSync('dist'))
							fs.rmSync('dist', { recursive: true });
						var processFiles = function (d) {
							var files = fs.readdirSync(d);
							for (var i = 0; i < files.length; i++) {
								if (files[i].indexOf('.js') > 0) {
									var i2 = 0, s = fs.readFileSync(d + files[i], 'utf8');
									while ((i2 = s.indexOf('webCall: \'', i2)) > -1) {
										i2 += 10;
										s = s.substring(0, i2) + files[i].substring(0, files[i].length - 3) + '.' + method(s.substring(0, i2)) + s.substring(s.indexOf('\',', i2));
									}
									fs.writeFileSync(d + files[i], s);
								}
							}
						};
						processFiles(dir);
						processFiles(dir + 'elements/');
						processFiles(dir + 'pages/');
					})
				}
			},
			{
				apply: compiler => {
					compiler.hooks.afterEmit.tap('client', () => {
						var fs = require('fs'), file, client = env && env.client && !isNaN(env.client) ? env.client : '1';
						var props = JSON.parse(fs.readFileSync('clients/' + client + '/props.json', 'utf8'));
						if (!props)
							throw 'client ' + client + ' does not exists!';
						props.nameShort = props.name.indexOf(' · ') > -1 ? props.name.substring(props.name.indexOf(' · ') + 3) : props.name;
						fs.mkdirSync('dist/audio');
						fs.mkdirSync('dist/css');
						fs.mkdirSync('dist/font');
						fs.mkdirSync('dist/images');
						fs.mkdirSync('dist/js/lang');
						fs.cpSync('src/audio/', 'dist/audio', { recursive: true });
						fs.cpSync('src/font/', 'dist/font', { recursive: true });
						fs.cpSync('src/images/', 'dist/images', { recursive: true });
						fs.cpSync('src/js/lang/', 'dist/js/lang', { recursive: true });
						fs.cpSync('src/css/elements.css', 'dist/css/elements.css');
						fs.cpSync('src/logoutcallback.html', 'dist/logoutcallback.html');
						fs.cpSync('src/oauthcallback.html', 'dist/oauthcallback.html');
						if (fs.existsSync('clients/' + client + '/images/favicon.ico'))
							fs.cpSync('clients/' + client + '/images/favicon.ico', 'dist/favicon.ico');
						file = '/css/main.css';
						fs.writeFileSync('dist' + file, fs.readFileSync('clients/' + client + '/style.css', 'utf8') + '\n\n' + fs.readFileSync('src/css/elements.css', 'utf8') + '\n\n' + fs.readFileSync('src' + file, 'utf8'));
						fs.writeFileSync('dist/index.html', fs.readFileSync('src/index.html', 'utf8')
							.replace(/\{placeholderAppleId}/g, props.appleId)
							.replace(/\{placeholderEmail}/g, props.email)
							.replace(/\{placeholderName}/g, props.name)
							.replace(/\{placeholderDescription}/g, props.name + ' · Events · ' + props.en.buddies)
							.replace(/\{placeholderUrl}/g, props.url)
							.replace(/\{placeholderBundleID}/g, props.bundleId)
							.replace(/\{placeholderHost}/g, props.url.substring(8))
							.replace(/\{placeholderSchema}/g, props.url.substring(8, props.url.lastIndexOf('.'))));
						file = 'dist/js/init.js';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
							.replace('{imprintCustom}', props.imprint ? props.imprint : '')
							.replace('{placeholderAppTitle}', props.name)
							.replace('{placeholderClientId}', '' + Math.max(parseInt(client), 1))
							.replace('{placeholderServer}', props.server)
							.replace('{placeholderFacebookId}', props.facebookId)
							.replace(/\{placeholderBundleID}/g, props.bundleId)
							.replace(/\{placeholderAppConfig}/g, JSON.stringify(props.appConfig).replace(/\"/g, '\\"'))
							.replace(/\{placeholderAppleID}/g, props.appleId));
						file = 'dist/oauthcallback.html';
						fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
							.replace('{protocol}', props.url.substring(8, props.url.lastIndexOf('.'))));
						var languages = ['de', 'en'];
						for (var i = 0; i < languages.length; i++) {
							file = 'dist/js/lang/' + languages[i].toUpperCase() + '.html';
							fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
								.replace(/\{placeholderAppTitle}/g, props.name));
							file = 'dist/js/lang/' + languages[i].toUpperCase() + '.json';
							fs.writeFileSync(file, fs.readFileSync(file, 'utf8')
								.replace(/\${infoDescription}/g, props[languages[i]].infoDescription.replace(/"/g, '\\"'))
								.replace(/\${introDescription}/g, props[languages[i]].introDescription.replace(/"/g, '\\"'))
								.replace(/\${marketingOpenArticleText}/g, props[languages[i]].marketingOpenArticleText)
								.replace(/\${buddy}/g, props[languages[i]].buddy)
								.replace(/\${buddies}/g, props[languages[i]].buddies)
								.replace('"{skills}",', props[languages[i]].skills ? JSON.stringify(props[languages[i]].skills) + ',' : ''));
						}
						var regexs = [
							{
								pattern: /(<widget .*version=")([^"]+)/,
								replace: '$1' + fs.readFileSync('src/js/global.js', 'utf8').match(/static appVersion = '([^']*)/)[1]
							},
							{
								pattern: /(<widget id=")([^"]+)/,
								replace: '$1' + props.bundleId
							},
							{
								pattern: /(<name\>)([^<]+)/,
								replace: '$1' + props.nameShort
							},
							{
								pattern: /(<description\>)([^<]+)/,
								replace: '$1' + props.name + ' · Events · ' + props.en.buddies
							},
							{
								pattern: /(<author [^>]+)([^<]+)/,
								replace: '$1>' + props.name + ' Team'
							},
							{
								pattern: /(<author .*email=")([^"]+)/,
								replace: '$1' + props.email
							},
							{
								pattern: /(<author .*href=")([^"]+)/,
								replace: '$1' + props.url
							},
							{
								pattern: /(<host scheme="https" name=")([^"]+)/,
								replace: '$1' + props.url.substring(8)
							},
							{
								pattern: /(<host scheme=")([^"]+)(" name="" event="fb")/,
								replace: '$1' + props.url.substring(8, props.url.lastIndexOf('.')) + '$3'
							}
						];
						file = '../spontify.me-app/config.xml';
						var s = fs.readFileSync(file, 'utf8');
						for (var i = 0; i < regexs.length; i++) {
							if (!regexs[i].pattern.test(s)) {
								fs.rmdirSync('dist', { recursive: true });
								throw new Error('regex ' + regexs[i].pattern + ' failed');
							}
							s = s.replace(regexs[i].pattern, regexs[i].replace);
						}
						fs.writeFileSync(file, s);
						file = '../spontify.me-app/GoogleService-Info.plist';
						s = fs.readFileSync(file, 'utf8');
						s = s.replace(/(<string>com\.jq\.)([^<]+)/, '$1' + props.bundleId.substring(7));
						fs.writeFileSync(file, s);
						file = '../spontify.me-app/google-services.json';
						s = fs.readFileSync(file, 'utf8');
						s = s.replace(/("package_name": "com\.jq\.)([^"]+)/, '$1' + props.bundleId.substring(7));
						fs.writeFileSync(file, s);
						file = 'dist/images/logo.svg';
						s = fs.readFileSync(file, 'utf8')
							.replace('{placeholderAppTitle}', props.nameShort);
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