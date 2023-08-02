const path				= require('path');
const log				= require('@whi/stdlog')(path.basename( __filename ), {
    level: process.env.LOG_LEVEL || 'fatal',
});

const expect				= require('chai').expect;
const { serialize, ...json }		= require('../../src/index.js');


function basic_tests () {
    it("should handle Buffer", async () => {
	let input			= Buffer.from("Hello");
	let bytes			= serialize( input );

	expect( bytes			).to.have.length( 45 );

	let result			= json.deserialize( bytes );
	expect( result			).to.deep.equal( input );
    });

    it("should handle large Buffer", async () => {
	let input			= Buffer.from(new Uint8Array(51));
	let bytes			= serialize( input );

	expect( bytes			).to.have.length( 128 );

	let result			= json.deserialize( bytes );
	expect( result			).to.deep.equal( input );
    });

    it("should handle Uint8Array", async () => {
	let input			= new Uint8Array(Buffer.from("Hello"));
	let bytes			= serialize( input );

	expect( bytes			).to.have.length( 49 );

	let result			= json.deserialize( bytes );
	expect( result			).to.deep.equal( input );
    });

    it("should handle null", async () => {
	let input			= null;
	let bytes			= serialize( input );

	expect( bytes			).to.have.length( 4 );

	let result			= json.deserialize( bytes );
	expect( result			).to.deep.equal( input );
    });
}

describe("Serialize", () => {

    describe("Basic", basic_tests );

});
