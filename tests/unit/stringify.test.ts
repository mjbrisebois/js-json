import { expect } from 'chai';
import json from '../../src/index';

function basic_tests() {
    it('should handle Buffer', async () => {
        let result = json.stringify(Buffer.from('Hello'));

        expect(result).to.deep.equal(
            JSON.stringify({
                data: [72, 101, 108, 108, 111],
                type: 'Buffer',
            })
        );
    });

    it('should handle large Buffer', async () => {
        let result = json.stringify(Buffer.from(new Uint8Array(51)));

        expect(result).to.deep.equal(
            JSON.stringify({
                data: new Array(51).fill(0),
                type: 'Buffer',
            })
        );

        let result1 = json.stringify(Buffer.from(new Uint8Array(52)));

        expect(result1).to.deep.equal(
            JSON.stringify({
                data: new Array(52).fill(0),
                type: 'Buffer',
            })
        );
    });

    it('should handle Uint8Array', async () => {
        let result = json.stringify(new Uint8Array(Buffer.from('Hello')));

        expect(result).to.deep.equal(
            JSON.stringify({
                data: [72, 101, 108, 108, 111],
                type: 'Uint8Array',
            })
        );
    });

    it('should handle null', async () => {
        let result = json.stringify({
            empty: null,
        });

        expect(result).to.deep.equal(
            JSON.stringify({
                empty: null,
            })
        );
    });
}

describe('Stringify', () => {
    describe('Basic', basic_tests);
});
