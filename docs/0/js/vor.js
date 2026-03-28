// vor: Validatorの略
// vor.typeOf(target).is(a=>a.p.number.integer.positive);
// vor.typeOf(target).expect(a=>a.p.number.integer.positive);
// vor.valueOf(target).is('A');
// vor.valueOf(target).is(...candidates);
// vor.rangeOf(target).is(min, max);
// vor.self(target).has('name', a=>descriptor.accessor.gs);
// vor.self(target).has('name', a=>method.async.generator);
// vor.self(target).has('name', a=>field);
// vor.proto(target).has('name', a=>field);
// vor.chain(target).has('name', a=>field);
import {ValidationError} from './lib/error.js';
import {TypeOfAssertion, isPri, isRef} from './lib/type.js';
//const isPri = (v)=>v !== Object(v);
//const isRef = (v)=>v === Object(v);
class Validator {
    static typeOf(target) {return new TypeOfValidator(target)}
    static valueOf(target) {return new ValueOfValidator(target)}
    static rangeOf(target) {return new RangeOfValidator(target)}
    static self(target) {return new SelfOwnValidator(target)}
    static proto(target) {return new ProtoOwnValidator(target)}
    static chain(target) {return new ChainOwnValidator(target)}
}
class OfValidator {
    constructor(target) {this._={target}}
    is(){this.#throw()} // 真偽値を返す
    expect(){this.#throw()} // 例外発生しうる
    #throw() {throw new Error(`プログラミングエラー。オーバーライドしてください。`)}
}
class OwnValidator {
    constructor(target) {
        this._={target}
        // targetはクラス／インスタンス／オブジェクト{}／ES5(関数オブジェクト／関数オブジェクトインスタンス)のいずれかであること
        if (isPri(target)) {throw new TypeError(`OwnValidator()の引数はプリミティブ値以外であるべきです。target:${target}`)}
    }
    has(){this.#throw()} // 真偽値を返す
    expect(){this.#throw()} // 例外発生しうる
    #throw() {throw new Error(`プログラミングエラー。オーバーライドしてください。`)}
}
class TypeOfValidator extends OfValidator {
    constructor(target) {super(target)}
    is(fn) {return this.#run('is', fn)}
    expect(fn) {return this.#run('expect', fn)}
    #run(methodName, fn) {
        const a = fn(TypeOfAssertion);
        if (a instanceof TypeAssertion) {return a[methodName](this._.target);}
        else if (isPrimitiveClass(fn) || isCls(fn)) {return this._.target instanceof fn}
        else {throw new TypeError(`TypeOfValidator.${methodName}(fn)の引数はTypeAssertionを返す関数であるべきです。またはクラスであるべきです。`)}
    }
}
class ValueOfValidator extends OfValidator {
    constructor(target) {super(target)}
    is(...candidates) {return this.#run('is', ...candidates)}
    expect(...candidates) {return this.#run('expect', ...candidates)}
    #run(methodName, ...candidates) {
        if (0===candidates.length) {throw new TypeError(`ValueOfValidator.${methodName}()の引数に一つ以上の期待値を渡してください。`)}
        for (let c of candidates) {
            if (c===this._.target) {return true}
        }
        if ('expect'===methodName) {throw new ValidateError(`値は期待値と違います。実際値:${this._.target} 期待値: ${candidates}`)}
    }
}
class RangeOfValidator extends OfValidator {
    constructor(target) {
        super(target);
        this._.type = this.#isNum(target) ? 'integer' : (this.#isBig(target) ? 'bigint' : '');
        if (''===this._.type) {throw new TypeError(`RangeOfValidatorのtargetはNumber.isSafeInteger()が真を返す値かBigIntであるべきです。target:${target} typeof:${typeof target}`)}
    }
    is(min, max) {return this.#run('is', min, max)}
    expect(min, max) {return this.#run('expect', min, max)}
    #run(methodName, min, max) {
        if ([min,max].some(v=>'integer'===this._.type ? !this.#isNum(v) : !this.#isBig(v))) {
            throw new TypeError(`RangeOfValidator.${methodName}(min,max)の引数の型は両方共${this.#label}にすべきです。min:${min}(${typeof min}), max:${max}(${typeof max})`);
        }
        if (max<=min) {throw new RangeError(`RangeOfValidator.${methodName}(min,max)の引数の値はmin<maxであるべきです。min:${min}, max:${max}`)}
        const is = this.#within(min,max);
        if ('expect'===methodName && !is) {throw new ValidateError(`値が期待値と違います。実際値:${this._.target} 期待値:${min}〜${max}(${this.#label})`)}
        return is;
    }
    #isNum(v) {return Number.isSafeInteger(v)}
    #isBig(v) {return 'bigint'===typeof v}
    get #label() {return 'integer'===this._.type ? 'Number.isSafeInteger()が真を返す値' : 'BigInt'}
    #within(min,max) {return min<=this._.target && this._.target<=max}
}
class OwnerOwnValidator extends OwnValidator {
    constructor(target, find) {super(target); this._.find=find;}
    has(name, fn) {return this.#run('has', name, fn)} // 真偽値を返す
    expect(name, fn) {return this.#run('expect', name, fn)} // 例外発生しうる
    #run(methodName, name, fn) {
        if (!this._.find(name, this._.target)) {throw new ValidateError(`${this.constructor.name}.${methodName}(name, fn)で期待した名前${name}は持っていませんでした。target:${target}`)}
        const a = fn(); // a=>a.descriptor.accessor.getter/a=>a.method.async.generator
        const r = a.has(name, this._.target);
        if ('expected'===methodName && !r) {throw new ValidateError(`期待した名前のプロパティは期待した型と違います。name:${name} 実際値:${a.label} 期待値:${Type.getLabel(name, this._.target)}`)}
        return r;
    }
}
class SelfOwnValidator extends OwnerOwnValidator {
    constructor(target) {super(target, (name,owner)=>Object.hasOwn(owner, name));}
}
class ProtoOwnValidator extends OwnerOwnValidator {
    /**
    * 自身を除いてプロトタイプチェーンを遡り、指定された名前のプロパティが存在するか確認する
    * @param {Object} obj - 調査対象のオブジェクト
    * @param {string} propertyName - 確認するプロパティ名
    * @returns {boolean} - プロトタイプチェーン上に存在すればtrue
    */
    static hasPropertyInPrototype(propertyName, obj) {
        if (obj == null) return false;
        let proto = Object.getPrototypeOf(obj);
        while (proto !== null) {
            if (Object.prototype.hasOwnProperty.call(proto, propertyName)) {return true;}
            proto = Object.getPrototypeOf(proto);
        }
        return false;
    }
    constructor(target) {super(target, (name,owner)=>ProtoOwnValidator.hasPropertyInPrototype(name,owner));}
}
class ChainOwnValidator extends OwnerOwnValidator {
    constructor(target) {super(target, (name,owner)=>name in owner);}
}
export {
    Validator as vor,
    // 以降は単体テスト用にexportする。本番用ではexportしない。
    OfValidator,
    OwnValidator,
    TypeOfValidator,
    ValueOfValidator,
    RangeOfValidator,
    OwnerOwnValidator,
    SelfOwnValidator,
    ProtoOwnValidator,
    ChainOwnValidator,
}

