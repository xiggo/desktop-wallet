var fs = require('fs-extra');
fs.copy('./rebrand/src/styles', './src/styles');
fs.copy('./rebrand/src/app/assets/svg/currencies', './src/app/assets/svg/currencies');
fs.copy('./rebrand/node_modules/@payvo/sdk-ark', './node_modules/@payvo/sdk-ark');
fs.copy('./rebrand/node_modules/@payvo/sdk-lsk', './node_modules/@payvo/sdk-lsk');
fs.copy('./rebrand/node_modules/@arkecosystem/crypto-networks/dist', './node_modules/@arkecosystem/crypto-networks/dist');