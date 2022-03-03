node_modules: package.json package-lock.json
	npm install --only=production

lambda.zip: node_modules *.js
	zip -r lambda.zip node_modules *.js
