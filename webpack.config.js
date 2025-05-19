import webpack				from 'webpack';

export default {
    target: 'node',
    mode: 'production', // production | development
    entry: [ './lib/index.js' ],
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
