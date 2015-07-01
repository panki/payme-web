# Builds everything
all: var npm bower gulp

clean:
	rm -rf node_modules/*
	rm -rf public/*

# Make var dirs
var:
	mkdir -p var/run
	mkdir -p var/log
	mkdir -p var/tmp


# Install NPM dependencies
npm:
	npm install

bower:
	bower install

gulp:
	gulp
