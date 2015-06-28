# Builds everything
all: var npm

# Make var dirs
var:
	mkdir -p var/run
	mkdir -p var/log
	mkdir -p var/tmp


# Install NPM dependencies
npm:
	npm install
