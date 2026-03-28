import { expect, test, describe } from "bun:test";
import { ValidationError } from "./lib/error.js";
import {
    vor,
    OfValidator,
    OwnValidator,
    TypeOfValidator,
    ValueOfValidator,
    RangeOfValidator,
    OwnerOwnValidator,
    SelfOwnValidator,
    ProtoOwnValidator,
    ChainOwnValidator,
} from "./vor.js";
const getTag = (v) => Object.prototype.toString.call(v).slice(8, -1);
describe('vor', () => {
    describe('typeOf()', () => {
        test('TypeOfValidator', () => {
            expect(vor.typeOf(1)).toBeInstanceOf(TypeOfValidator);
        });
    })
    describe('typeOf()', () => {
        test('ValueOfValidator', () => {
            expect(vor.valueOf(1)).toBeInstanceOf(ValueOfValidator);
        });
    });
    describe('typeOf()', () => {
        test('RangeOfValidator', () => {
            expect(vor.rangeOf(1)).toBeInstanceOf(RangeOfValidator);
        });
    });
    describe('self()', () => {
        test('SelfOwnValidator', () => {
            expect(vor.self({})).toBeInstanceOf(SelfOwnValidator);
        });
    });
    describe('proto()', () => {
        test('ProtoOwnValidator', () => {
            expect(vor.proto({})).toBeInstanceOf(ProtoOwnValidator);
        });
    });
    describe('chain()', () => {
        test('ChainOwnValidator', () => {
            expect(vor.chain({})).toBeInstanceOf(ChainOwnValidator);
        });
    });
});

