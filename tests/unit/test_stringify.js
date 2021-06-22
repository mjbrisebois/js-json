const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;
const { stringify }			= require('../../src/index.js');


function basic_tests () {
    it("should handle Buffer", async () => {
	let json			= stringify( Buffer.from("Hello") );

	expect( json			).to.deep.equal( JSON.stringify({
	    "data": [72,101,108,108,111],
	    "type": "Buffer",
	}) );
    });

    it("should handle large Buffer", async () => {
	let json			= stringify( Buffer.from(new Uint8Array(51)) );

	expect( json			).to.deep.equal( JSON.stringify({
	    "data": (new Array(51)).fill(0),
	    "type": "Buffer",
	}) );

	let json1			= stringify( Buffer.from(new Uint8Array(52)) );

	expect( json1			).to.deep.equal( JSON.stringify({
	    "data": (new Array(52)).fill(0),
	    "type": "Buffer",
	}) );
    });

    it("should handle Uint8Array", async () => {
	let json			= stringify( new Uint8Array(Buffer.from("Hello")) );

	expect( json			).to.deep.equal( JSON.stringify({
	    "data": [72,101,108,108,111],
	    "type": "Uint8Array",
	}) );
    });

    it("should handle null", async () => {
	let json			= stringify({
	    "empty": null,
	});

	expect( json			).to.deep.equal( JSON.stringify({
	    "empty": null,
	}) );
    });
}

describe("Stringify", () => {

    describe("Basic", basic_tests );

});
