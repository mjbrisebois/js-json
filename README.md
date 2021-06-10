[![](https://img.shields.io/npm/v/@whi/json/latest?style=flat-square)](http://npmjs.com/package/@whi/json)

# Extending `JSON` functionality
This module is intended to extend the built-in JSON object with easier support for bytes,
key-ordering, and debugging.

[![](https://img.shields.io/github/issues-raw/mjbrisebois/js-json?style=flat-square)](https://github.com/mjbrisebois/js-json/issues)
[![](https://img.shields.io/github/issues-closed-raw/mjbrisebois/js-json?style=flat-square)](https://github.com/mjbrisebois/js-json/issues?q=is%3Aissue+is%3Aclosed)
[![](https://img.shields.io/github/issues-pr-raw/mjbrisebois/js-json?style=flat-square)](https://github.com/mjbrisebois/js-json/pulls)


## Overview
Existing JSON libraries

- `json-stable-stringify` - doesn't make use of the native `JSON.stringify`
- `fast-safe-stringify` - only addresses the circular reference issue
- `json-serializer` - lack of support/documentation and hasn't been touched since 2018
- `json-serialize` - lack of support/features and hasn't been touched since 2015

Some of these libraries would have been fine for what they do, but it would have been inefficient to
let each library walk the entire object just to do there 1 thing.


### Features

- Serialize/deserialize to JSON string
- Serialize/deserialize to `Uint8Array`
- Serialize/deserialize handles [Typed Array Views](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays#typed_array_views) & Buffer
- Object key ordering for deterministic serializing
- Debugging format for displaying human-readable JSON-like object dumps
- Debugging formatter handles circular references


## Install

```bash
npm i @whi/json
```

## Usage

```javascript
const json = require('@whi/json');

let input = {
    id: Buffer.from("Hello World")
};

json.stringify( input );
// '{"id":{"data":[72,101,108,108,111,32,87,111,114,108,100],"type":"Buffer"}}'

json.debug( input );
// '{
//     "id": "<Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>"
// }'

json.serialize( input );
// Uint8Array(74) [
//   123,  34, 105, 100, 34, 58, 123,  34, 100,  97, 116,  97,
//    34,  58,  91,  55, 50, 44,  49,  48,  49,  44,  49,  48,
//    56,  44,  49,  48, 56, 44,  49,  49,  49,  44,  51,  50,
//    44,  56,  55,  44, 49, 49,  49,  44,  49,  49,  52,  44,
//    49,  48,  56,  44, 49, 48,  48,  93,  44,  34, 116, 121,
//   112, 101,  34,  58, 34, 66, 117, 102, 102, 101, 114,  34,
//   125, 125
// ]

let str = json.stringify( input );
let bytes = json.serialize( input );

// Parse can take JSON or JSON-bytes
json.parse( str );
// { id: <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64> }
json.parse( bytes );
// { id: <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64> }

json.deserialize( bytes );
// { id: <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64> }

// Deserialize can only take bytes
json.deserialize( str );
// TypeError [ERR_INVALID_ARG_TYPE]: The "input" argument must be an instance of ArrayBuffer or ArrayBufferView. Received type string ('{"id":{"data":[72,101,10...)
```

### API Reference

See [docs/API.md](docs/API.md)

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
