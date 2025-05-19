import { expect } 			from "chai";
import json				from '../../src/index';

function basic_tests () {
    it("should handle Buffer", async () => {
	let input			= Buffer.from("Hello");
	let json_str			= json.stringify( input );
	let result			= json.parse( json_str );

	expect( result.constructor.name	).to.equal("Buffer");
	expect( result			).to.deep.equal( input );
    });

    it("should handle Uint8Array", async () => {
	let input			= new Uint8Array(Buffer.from("Hello"));
	let json_str			= json.stringify( input );
	let result			= json.parse( json_str );

	expect( result			).to.deep.equal( input );
    });

    it("should handle DataView", async () => {
	let input			= new DataView( new Uint8Array( Buffer.from("Hello") ).buffer );
	let json_str			= json.stringify( input );
	let result			= json.parse( json_str );

	expect( result			).to.deep.equal( input );
    });

    it("should handle byte input", async () => {
	let input			= Buffer.from("Hello");
	let bytes			= json.serialize( input );
	let result			= json.parse( bytes );

	expect( result			).to.deep.equal( input );
    });

    it("should handle ISO date", async () => {
	let input			= new Date();
	let bytes			= json.serialize( input );
	let result			= json.parse( bytes );

	expect( result			).to.deep.equal( input );
    });
}

describe("Parse", () => {

    describe("Basic", basic_tests );

});
