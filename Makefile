## Copyright (c) 2015 - Littlstar

##
# Standalone library namespace
STANDALONE := starplate

##
# node_modules/ patch
NODE_MODULES := node_modules

##
# Browserify bin path
BROWSERIFY := $(NODE_MODULES)/.bin/browserify

##
# Tests tor un
TESTS := $(wildcard test/*.js)

##
# uglifyjs bin path
UGLIFY := $(NODE_MODULES)/.bin/uglifyjs

##
# npm bin path
NPM := $(shell which npm)

$(NODE_MODULES):
	$(NPM) install

##
# Build all tests for web execution
.PHONY: test
test: $(TESTS)

##
# Build test for web execution
.PHONY: $(TESTS)
$(TESTS): $(NODE_MODULES)
	$(BROWSERIFY) --im -s _ $@ -t babelify -o test/web/$(notdir $(@:.js=))/build.js

##
# Create dist build
.PHONY: dist
dist:
	mkdir -p $(@)
	$(NPM) run compile
	$(BROWSERIFY) --im -s $(STANDALONE) -t babelify lib/index.js -o $@/$(STANDALONE).js
	$(UGLIFY) --compress --mangle --output $@/$(STANDALONE).min.js -- $@/$(STANDALONE).js

clean:
	$(RM) -rf lib/
	$(RM) -rf components/
	$(RM) -rf node_modules/
