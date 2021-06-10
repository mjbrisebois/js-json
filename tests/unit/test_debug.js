const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;
const { debug, ...json }		= require('../../src/index.js');

if ( process.env.LOG_LEVEL )
    json.logging();

function basic_tests () {
    it("should handle Buffer", async () => {
	let json			= debug( Buffer.from("Hello") );

	expect( json			).to.equal(`"<Buffer 48 65 6c 6c 6f>"`);
    });

    it("should handle large Buffer", async () => {
	let json			= debug( Buffer.from(new Uint8Array(51)) );

	expect( json			).to.equal(`"<Buffer${' 00'.repeat(50)} ... 1 more byte>"`);

	let json1			= debug( Buffer.from(new Uint8Array(52)) );

	expect( json1			).to.equal(`"<Buffer${' 00'.repeat(50)} ... 2 more bytes>"`);
    });

    it("should handle Uint8Array", async () => {
	let json			= debug( new Uint8Array(Buffer.from("Hello")) );

	expect( json			).to.equal(`"<Uint8Array 48 65 6c 6c 6f>"`);
    });

    it("should handle circular reference", async () => {
	let input			= {};
	input.self			= input;
	let json			= debug( input, null );

	expect( json			).to.equal(`{"self":"[Circular]"}`);
    });

    it("should handle circular reference made by replacer", async () => {
	let input			= {};
	let json			= debug( input, null, (k,v) => {
	    v.self			= v;
	    return v;
	});

	expect( json			).to.equal(`{"self":"[Circular]"}`);
    });
}

describe("Debug", () => {

    describe("Basic", basic_tests );

});
