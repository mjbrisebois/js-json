[back to README.md](../README.md)

# API Reference

- `stringify`  is an alias for `toString`
- `parse` is an alias for `fromString`
- `debug`  is an alias for `toReadableString`
- `serialize`  is an alias for `toBytes`
- `deserialize`  is an alias for `fromBytes`

Examples assume the module is loaded like this
```javascript
const json = require('@whi/json');
```

### Argument: `replacer( key, value )`
The `replacer` callback is given the parent's key and the current value.  `this` is set to the
parent object in-case you need access to it (ergo `this[key] == value`).

Example of replacing `Uint8Array` with `Array`
```javascript
function replacer (key, value) {
    if ( value instanceof Uint8Array )
        return [].slice.call(value);
    return value;
}
```

### Argument: `reviver( key, value )`
The `reviver` callback is given the parent's key and the current value.  `this` is set to the parent
object in-case you need access to it (ergo `this[key] == value`).

Example of reviving `Buffer`
```javascript
function reviver (key, value) {
    if ( typeof value === "object" && value !== null && value.type === "Buffer" )
        return Buffer.from( value.data );
    return value;
}
```


## `toString( value, indent, replacer, ordered = true )`
JSON encode a value.

Differences from `JSON.stringify`

- Handles [Typed Array
  Views](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays#typed_array_views)
  like [Node.js Buffer.toJSON()](https://nodejs.org/api/buffer.html#buffer_buf_tojson)
- Keys are ordered by default but can be disabled via the 4th argument


## `fromString( source, reviver )`
Deserialize JSON back into object form.

Differences from `JSON.parse`

- Revives serialized [Typed Array
  Views](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays#typed_array_views)
- Revives `Buffer` if present; otherwise, falls back to `Uint8Array`
- Revives `Date` objects if a string matches the ISO date format


## `toReadableString( value, indent = 4, replacer )`
JSON encode a value with more human readable replacements.  Several formatting features were
inspired by Node's REPL formatting.

Differences from `toString`

- Formats Buffers like Node's REPL
    - eg. `<Buffer 48 65 6c 6c 6f>`
- Formats [Typed Array
  Views](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays#typed_array_views)
    - eg. `Uint8Array { 72, 101, 108, 108, 111 }`
- Handles `BigInt`
- Replaces circular references with `[Circular]`


## `toBytes( value, replacer )`
Runs a `value` through `toString` and then uses the built-in UTF-8 `TextEncoder` to return a
`Uint8Array`.


## `fromBytes( bytes, reviver )`

Uses the built-in UTF-8 `TextDecoder` to process `Uint8Array` input.  Then runs the result through
`fromString`.
