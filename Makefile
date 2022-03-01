node_modules:
	npm install

lambda.zip: node_modules config.js index.js
	zip -r lambda.zip node_modules config.js index.js 
