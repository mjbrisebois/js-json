
const { walk, ...objwalk }		= require('@whi/object-walk');

let debug				= false;

function log ( msg, ...args ) {
    let datetime			= (new Date()).toISOString();
    console.log(`${datetime} [ src/index. ]  INFO: ${msg}`, ...args );
}

const BUILTINS				= typeof window === "undefined" ? global : window;
const TYPED_ARRAYS			= [
    "Int8Array",
    "Uint8Array",
    "Int8ClampedArray",

    "Int16Array",
    "Uint16Array",

    "Int32Array",
    "Uint32Array",
    "Float32Array",

    "Float64Array",
    "BigInt64Array",
    "BigUint64Array",
];

function hex (n, pad = 8) {
    return ( "0".repeat(pad) + n.toString(16) ).substr(-pad);
}

function bytes_to_hexstr ( bytes, name, truncate_views ) {
    debug && log("Creating hex representation for:", name, bytes );
    let truncated_bytes			= bytes.length - truncate_views;
    let hexstr				= [].slice.call(bytes, 0, truncate_views).map(n => hex(n,2)).join(' ') + (
	truncated_bytes > 0
	    ? ` ... ${bytes.length-truncate_views} more ` + ( truncated_bytes === 1 ? "byte" : "bytes")
	    : ""
    );
    return `<${name} ${hexstr}>`;
}

function view_to_repr ( values, name, truncate_views ) {
    debug && log("Creating representation for ArrayBuffer view:", name, values );
    let truncated_values		= values.length - truncate_views;
    let intstr				= [].slice.call(values, 0, truncate_views).join(', ') + (
	truncated_values > 0
	    ? ` ... ${values.length-truncate_views} more ` + ( truncated_values === 1 ? "value" : "values")
	    : ""
    );
    return `${name} { ${intstr} }`;
}

function is_object (value) {
    return typeof value === 'object' && value !== null;
}

function standard_replacer ( key, value ) {
    if ( is_object(value) ) {
	if ( ArrayBuffer.isView( value ) ) {
	    let name			= value.constructor.name;
	    debug && log("Using standard replacement for ArrayBuffer view:", name );

	    if ( value instanceof DataView ) {
		value			= new Uint8Array( value.buffer );
	    }

	    debug && log("Using standard replacement for:", name );
	    return {
		"type": name,
		"data": [].slice.call(value),
	    };
	}
    }

    return value;
}

const RAW_PREFIX			= "__#raw#__";
const RAW_PREFIX_REGEX			= new RegExp( `\"${RAW_PREFIX}(.+?)\"`, "g" );
function human_readable_replacer ( key, value, truncate_views ) {
    if ( is_object(value) ) {
	if ( "Buffer" === value.constructor.name ) {
	    return RAW_PREFIX + bytes_to_hexstr( value, value.constructor.name, truncate_views );
	}
	else if ( value.type === "Buffer" ) {
	    return RAW_PREFIX + bytes_to_hexstr( value.data, value.type, truncate_views );
	}

	if ( ArrayBuffer.isView( value ) ) {
	    return RAW_PREFIX + view_to_repr( value, value.constructor.name, truncate_views );
	}
    }
    if ( typeof value === "bigint" ) {
	return RAW_PREFIX + value.toString() + "n";
    }

    return value;
}

// Reviver cannot have a 'path' parameter (like replacer does) because 'JSON.parse' calls reviver on
// the children before the parent.  So we have no way to track the parent keys to form a path
// argument.
const ISO_REGEX				= /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;
function standard_reviver ( key, value ) {
    if ( is_object(value) ) {
	if ( value.type === "Buffer" ) {
	    debug && log("Using standard reviver for:", value.type );

	    return typeof Buffer === "undefined"
		? new Uint8Array( value.data )
		: Buffer.from( value.data );
	}
	else if ( value.type === "DataView" ) {
	    debug && log("Using standard reviver for:", value.type );

	    let bytes			= new Uint8Array( value.data.length );
	    bytes.set( value.data );
	    return new DataView( bytes.buffer );
	}
	else if ( TYPED_ARRAYS.includes( value.type ) ) {
	    debug && log("Using standard reviver for:", value.type );
	    return new BUILTINS[value.type]( value.data );
	}
    }

    if ( typeof value === "string" ) {
	debug && log("Checking for ISO date:", value, ISO_REGEX.test(value) );
	if ( value.endsWith("Z") && ISO_REGEX.test(value) )
	    return new Date(value);
    }

    return value;
}

const utf8 = {
    "_encoder": new TextEncoder(),
    "_decoder": new TextDecoder(),
    encode ( str ) {
	return this._encoder.encode( str );
    },
    decode ( bytes ) {
	return this._decoder.decode( bytes );
    },
}

function toBytes ( value, replacer ) {
    let json_str			= toString( value, null, replacer );

    debug && log("UTF-8 encode JSON string with length:", json_str.length );
    return utf8.encode( json_str );
}

function fromBytes ( bytes, reviver ) {
    debug && log("UTF-8 decode bytes with length:", bytes.length );
    let json_str			= utf8.decode( bytes );

    debug && log("UTF-8 decoded bytes to JSON with length:", json_str.length );
    return fromString( json_str, reviver );
}

function toString ( value, indent, replacer, ordered = true ) {
    if ( replacer !== undefined && typeof replacer !== "function" )
	throw new TypeError(`Replacer must be a function; not type '${typeof replacer}'`);

    let keys				= [];
    value				= walk( value, (k,v) => {
	if ( typeof k === "string" && ordered === true )
	    keys.push( k );

	try {
	    v				= v.toJSON( k );
	} catch (err)  {
	    if ( !(err instanceof TypeError
		   && ( err.message.includes("toJSON is not a function")
			|| err.message.includes("Cannot read property 'toJSON'"))) )
		throw err;
	}

	if ( is_object(v) && v.constructor.name === "Object" )
	    v				= Object.assign({}, v);

	if ( typeof replacer === "function" )
	    v				= replacer( k, v );

	return standard_replacer( k, v );
    });

    if ( ordered === true ) {
	keys.sort();
    }
    else {
	debug && console.warning("Using unordered keys for JSON.stringify");
    }

    debug && log("JSON stringify with keys:", keys );
    return JSON.stringify( value, keys, indent );
}


function toReadableString ( value, indent, replacer ) {
    let options				= {
	"indent": 4,
	"truncate_views": 50,
    };
    if ( typeof indent === "object" && indent !== null )
	options				= Object.assign( options, indent );
    else if ( indent !== undefined )
	options.indent			= indent;

    if ( replacer !== undefined && typeof replacer !== "function" )
	throw new TypeError(`Replacer must be a function; not type '${typeof replacer}'`);

    let seen				= new WeakMap();
    value				= walk( value, (k,v,path) => {
	if ( seen.get(v) )
	    return `${RAW_PREFIX}[Circular reference to #/${seen.get(v).join('/')}]`;

	if ( is_object(v) ) {
	    seen.set( v, path ); // Add value before copy

	    try {
		v			= v.toJSON( k );
	    } catch (err)  {
		if ( !(err instanceof TypeError
		       && ( err.message.includes("toJSON is not a function")
			    || err.message.includes("Cannot read property 'toJSON'"))) )
		    throw err;
	    }

	    if ( v.constructor.name === "Object" )
		v			= Object.assign({}, v);
	    if ( Array.isArray(v) )
		v			= v.slice();
	}

	if ( typeof replacer === "function" )
	    v				= replacer( k, v );

	if ( is_object(v) )
	    seen.set( v, path );

	return human_readable_replacer( k, v, options.truncate_views );
    });

    return JSON.stringify( value, null, options.indent ).replace(RAW_PREFIX_REGEX, function (match, value) {
	return value;
    });
}


function fromString ( source, reviver ) {
    if ( reviver !== undefined && typeof reviver !== "function" )
	throw new TypeError(`Reviver must be a function; not type '${typeof reviver}'`);

    if ( source instanceof Uint8Array )
	return fromBytes( source, reviver );
    else
	return JSON.parse( source, function (k,v) {
	    v				= standard_reviver( k, v );
	    return typeof reviver === "function"
		? reviver( k, v )
		: v;
	});
}

module.exports = {
    toBytes,
    "serialize": toBytes,

    fromBytes,
    "deserialize": fromBytes,

    toString,
    "stringify": toString,

    toReadableString,
    "debug": toReadableString,

    fromString,
    "parse": fromString,

    logging ( deep = false ) {
	debug				= true;
	if ( deep === true )
	    objwalk.logging();
    },
};
