import { expect } from 'chai';
import json from '../../src/index';

if (process.env.LOG_LEVEL) json.logging();

function basic_tests() {
    it('should handle Buffer', async () => {
        let buf = Buffer.from('Hello');
        let input = [
            {
                buffer: buf,
            },
        ];

        let text = json.debug(input);

        expect(text).to.equal(`[\n    {\n        "buffer": <Buffer 48 65 6c 6c 6f>\n    }\n]`);
        expect(input[0].buffer).to.deep.equal(buf); // Catch leftover RAW_PREFIX
    });

    it('should handle large Buffer', async () => {
        {
            let text = json.debug(Buffer.from(new Uint8Array(51)));
            expect(text).to.equal(`<Buffer${' 00'.repeat(50)} ... 1 more byte>`);
        }
        {
            let text = json.debug(Buffer.from(new Uint8Array(52)));
            expect(text).to.equal(`<Buffer${' 00'.repeat(50)} ... 2 more bytes>`);
        }
    });

    it('should adjust trim limit', async () => {
        {
            let text = json.debug(Buffer.from(new Uint8Array(5)), { truncate_views: 5 });
            expect(text).to.equal(`<Buffer${' 00'.repeat(5)}>`);
        }
        {
            let text = json.debug(Buffer.from(new Uint8Array(51)), { truncate_views: 5 });
            expect(text).to.equal(`<Buffer${' 00'.repeat(5)} ... 46 more bytes>`);
        }
        {
            let text = json.debug(new Uint8Array(51), { truncate_views: 5 });
            expect(text).to.equal(`Uint8Array { 0, 0, 0, 0, 0 ... 46 more values }`);
        }
    });

    it('should handle Uint8Array view', async () => {
        let text = json.debug(new Uint8Array(Buffer.from('Hello')));

        expect(text).to.equal(`Uint8Array { 72, 101, 108, 108, 111 }`);
    });

    it('should handle large views', async () => {
        {
            let text = json.debug(new Uint16Array(51));
            expect(text).to.equal(
                `Uint16Array {${' 0,'.repeat(50).slice(0, -1)} ... 1 more value }`
            );
        }
        {
            let text = json.debug(new Int32Array(52));
            expect(text).to.equal(
                `Int32Array {${' 0,'.repeat(50).slice(0, -1)} ... 2 more values }`
            );
        }
    });

    it('should handle large Array', async () => {
        {
            let text = json.debug(Array(5).fill('something'));
            expect(text).to.equal(`[\n${'    "something",\n'.repeat(5).slice(0, -2)}\n]`);
        }
        {
            let text = json.debug(Array(101).fill('something'));
            expect(text).to.equal(`[\n${'    "something",\n'.repeat(101).slice(0, -2)}\n]`);
        }
        {
            let text = json.debug(Array.from(new Uint8Array(101)));
            expect(text).to.equal(`[${' 0,'.repeat(50).slice(0, -1)} ... 51 more values ]`);
        }
    });

    it('should handle circular reference', async () => {
        let input = {} as any;
        input.self = input;
        let text = json.debug(input, null);

        expect(text).to.equal(`{"self":[Circular reference to #/]}`);
    });

    it('should handle circular reference made by replacer', async () => {
        {
            let input = {};
            let text = json.debug(input, null, (k: any, v: any) => {
                v.self = v;
                return v;
            });

            expect(text).to.equal(`{"self":[Circular reference to #/]}`);
        }
        {
            // Ensure that circular doesn't replace primitive types
            for (let primitive of [null, true, 'string', 1234]) {
                let json_encoded = JSON.stringify(primitive);
                expect(json.debug({ a: primitive, b: primitive }, null)).to.equal(
                    `{"a":${json_encoded},"b":${json_encoded}}`
                );
            }

            let primitive = Symbol() as any;
            expect(json.debug({ a: primitive, b: primitive }, null)).to.equal(`{}`);

            primitive = 9007199254740991n;
            expect(json.debug({ a: primitive, b: primitive }, null)).to.equal(
                `{"a":9007199254740991n,"b":9007199254740991n}`
            );
        }
    });

    it('should not circular reference primitive values', async () => {
        class Something {
            toJSON() {
                return 'primitive value';
            }
        }
        const eventual_primitive = new Something();

        const input = {
            eventual_primitive: eventual_primitive,
            sublevel: {
                list: [eventual_primitive],
                eventual_primitive: eventual_primitive,
            },
        };
        let text = json.debug(input);

        expect(text).to.equal(JSON.stringify(input, null, 4));
    });

    it('should distinguish between references to another branch vs circular', async () => {
        const u8 = new Uint16Array(1);
        {
            const input = {
                branch_1: u8,
                branch_2: {
                    ref: u8,
                },
            };
            let text = json.debug(input);

            expect(text).to.equal(
                `{\n    "branch_1": Uint16Array { 0 },\n    "branch_2": {\n        "ref": [Duplicate reference to object @ #/branch_1]\n    }\n}`
            );
        }
    });

    it('should handle undefined', async () => {
        {
            let input = undefined;
            let text = json.debug(input);

            expect(text).to.equal(`undefined`);
        }
        {
            let input = [undefined, undefined, 1];
            let text = json.debug(input);

            expect(text).to.equal(`[\n    undefined,\n    undefined,\n    1\n]`);
        }
    });
}

describe('Debug', () => {
    describe('Basic', basic_tests);
});
