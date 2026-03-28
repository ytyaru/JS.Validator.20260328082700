import { expect, test, describe } from "bun:test";
import { typer } from "./typer.js";
const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);
describe('typer', () => {
    describe('id()', () => {
        test('undefined', () => {
            expect(typer.id(undefined)).toBe('Undefined');
        });
    })
});

