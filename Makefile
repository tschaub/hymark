.DELETE_ON_ERROR:
export PATH := ./node_modules/.bin:$(PATH)

BUILD_DIR = ./build
LIB_DIR = ./lib
TEST_DIR = ./test

LIB_SCRIPT := $(shell find $(LIB_DIR) -name '*.js')
TEST_SCRIPT := $(shell find $(TEST_DIR) -name '*.js')
TEST_ALL := $(shell find $(TEST_DIR) -type f)

# Install Node based dependencies
node_modules/.install: package.json
	@npm install
	@touch $@


.PHONY: clean
clean:
	@rm -rf $(BUILD_DIR)


.PHONY: lint
lint: $(BUILD_DIR)/lib.lint $(BUILD_DIR)/test.lint

$(BUILD_DIR)/lib.lint: $(LIB_SCRIPT) .jshintrc node_modules/.install
	@jshint lib;
	@mkdir -p $(BUILD_DIR)
	@touch $@

$(BUILD_DIR)/test.lint: $(TEST_SCRIPT) .jshintrc node_modules/.install
	@jshint test;
	@mkdir -p $(BUILD_DIR)
	@touch $@


.PHONY: test
test: lint $(BUILD_DIR)/.test

$(BUILD_DIR)/.test: $(TEST_ALL) $(LIB_SCRIPT) node_modules/.install
	@lab test;
	@mkdir -p $(BUILD_DIR)
	@touch $@