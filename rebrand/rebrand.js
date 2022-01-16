var fs = require('fs-extra');
fs.copy('./rebrand/src/styles', './src/styles');
fs.copy('./rebrand/src/domains', './src/domains');
fs.copy('./rebrand/src/app', './src/app');
fs.copy('./rebrand/node_modules', './node_modules');
fs.copy('./rebrand/app-update.yml', './app-update.yml');