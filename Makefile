#
# Project
#
package-lock.json:	package.json
	npm install
	touch $@
node_modules:		package-lock.json
	npm install
	touch $@
build:			node_modules lib/index.js

dist/json.bundled.js: 	node_modules
	rm -rf dist
	npm run build

lib/index.js:           src/*.ts Makefile
	rm -rf lib
	npx tsc -t es2022 -m es2022 --moduleResolution node --esModuleInterop   \
		--strictNullChecks                                              \
		--outDir lib -d --sourceMap src/index.ts

#
# Testing
#
MOCHA_OPTS = --no-warnings --enable-source-maps -t 5000

test:				test-unit

test-unit:			build
	npx mocha $(MOCHA_OPTS) tests/unit/*.test.ts

test-unit-%:			build
	npx mocha $(MOCHA_OPTS) tests/unit/$*.test.ts
test-unit-debug:
test-unit-parse:
test-unit-serialize:
test-unit-stringify:


#
# Repository
#
clean-remove-chaff:
	@find . -name '*~' -exec rm {} \;
clean-files:		clean-remove-chaff
	git clean -nd
clean-files-force:	clean-remove-chaff
	git clean -fd
clean-files-all:	clean-remove-chaff
	git clean -ndx
clean-files-all-force:	clean-remove-chaff
	git clean -fdx


#
# NPM
#
prepare-package:	dist/json.bundled.js
	gzip -kf dist/*.js
preview-package:	clean-files test prepare-package
	npm pack --dry-run .
create-package:		clean-files test prepare-package
	npm pack .
publish-package:	clean-files test prepare-package
	npm publish --access public .
