[back to README.md](README.md)

# Contributing

## Overview
This package is designed to work with the native `JSON` object as much as possible.


## Development

See [docs/API.md](docs/API.md) for detailed API References

### `logging()`
Turns on debugging logs.

```javascript
const json = require('@whi/json');

json.logging(); // show debug logs
```

### Environment

- Developed using Node.js `v12.20.0`

### Building
No build required.  Vanilla JS only.

### Testing

To run all tests with logging
```
make test-debug
```

- `make test-unit-debug` - **Unit tests only**
- `make test-integration-debug` - **Integration tests only**

> **NOTE:** remove `-debug` to run tests without logging
