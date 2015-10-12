
NODE_MODULES := node_modules
BROWSERIFY := $(NODE_MODULES)/.bin/browserify
TESTS := $(wildcard test/*.js)
NPM := $(shell which npm)

$(NODE_MODULES):
	$(NPM) install

.PHONY: test
test: $(TESTS)

.PHONY: $(TESTS)
$(TESTS): $(NODE_MODULES)
	$(BROWSERIFY) -s _ $@ -o test/web/$(notdir $(@:.js=))/build.js
