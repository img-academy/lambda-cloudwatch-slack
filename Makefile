node_modules: package.json package-lock.json
	npm install

lambda.zip: node_modules config.js index.js
	zip -r lambda.zip node_modules config.js index.js 
