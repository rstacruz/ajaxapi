browserify := ./node_modules/.bin/browserify
uglify := ./node_modules/.bin/uglifyjs

ajaxapi.js: index.js
	$(browserify) -s Req $< | $(uglify) -m > $@
