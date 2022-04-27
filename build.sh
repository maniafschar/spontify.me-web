#!/usr/bin/env bash

# /Users/mani/Library/Android/sdk/emulator/emulator @Pixel_2_XL_API_29 &
# jar uf build.jar -C ../api/target/classes com/jq/findapp/util/MGObfuscator.class
# vi /etc/zshrc
# source ${ZDOTDIR:-$HOME}/zshrc
# java -jar build.jar ../app/www/ $@
# cd ../app
# export PATH=$PATH:/Users/mani/workspace/gradle-6.3/bin
# cordova build android

rm -r dist
npx webpack
cp -r src/css/ dist/css/
cp -r src/js/lang/ dist/js/lang/
cp -r src/font/ dist/font/
cp -r src/images/ dist/images/
cp src/*.html dist/
cp src/favicon.ico dist/

rm -r ../app/www/*
cp -r dist/ ../app/www/
rm ../app/www/images/store*

if [ "$1" = "d" ]; then
	sshpass -f passwd scp -r dist/* mani@62.67.240.21:/var/www/MG/
	echo "deployed"
fi;
