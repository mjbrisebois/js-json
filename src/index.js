
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

function bytes_to_hexstr ( bytes, name ) {
    debug && log("Creating hex representation for:", name, bytes );
    let truncated_bytes			= bytes.length - 50;
    let hexstr				= [].slice.call(bytes, 0, 50).map(n => hex(n,2)).join(' ') + (
	truncated_bytes > 0
	    ? ` ... ${bytes.length-50} more ` + ( truncated_bytes === 1 ? "byte" : "bytes")
	    : ""
    );
    return `<${name} ${hexstr}>`;
}

function is_object (value) {
    return typeof value === 'object' && value !== null;
}

function standard_replacer (key, value) {
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

function human_readable_replacer (key, value) {
    if ( is_object(value) && ["Buffer", ...TYPED_ARRAYS].includes( value.constructor.name ) ) {
	return bytes_to_hexstr( value, value.constructor.name );
    }

    return value;
}

function standard_reviver (key, value) {
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
    let keys				= [];
    value				= walk( value, (k,v) => {
	if ( typeof k === "string" && ordered === true )
	    keys.push( k );

	try {
	    v				= v.toJSON( k );
	} catch (err)  {
	    if ( !(err instanceof TypeError && err.message.includes("toJSON is not a function")) )
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

function toReadableString ( value, indent = 4, replacer ) {
    let circular_memory			= [];
    value				= walk( value, (k,v) => {
	if ( circular_memory.indexOf(v) !== -1 )
	    return `[Circular]`;

	if ( is_object(v) && v.constructor.name === "Object" ) {
	    circular_memory.push( v ); // Add value before copy
	    v				= Object.assign({}, v);
	}

	if ( typeof replacer === "function" )
	    v				= replacer( k, v );

	circular_memory.push( v );

	return human_readable_replacer( k, v );
    });

    return JSON.stringify( value, null, indent );
}


function fromString ( source, reviver ) {
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
    fromBytes,
    "serialize": toBytes,
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
