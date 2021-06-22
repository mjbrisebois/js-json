const webpack			= require('webpack');

module.exports = {
    target: 'node',
    mode: 'production', // production | development
    entry: [ './src/index.js' ],
    output: {
	filename: 'json.bundled.js',
	globalObject: 'this',
	library: {
	    "name": "JSON2",
	    "type": "umd",
	},
    },
    stats: {
	colors: true
    },
    devtool: 'source-map',
};
