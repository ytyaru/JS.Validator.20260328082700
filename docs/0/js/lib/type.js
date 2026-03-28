export const getId = (v) => Object.prototype.toString.call(v).slice(8, -1),
    isPri = (v)=>v !== Object(v),
    isRef = (v)=>v === Object(v),
    anyExe = (v) => 'function' === typeof v,
    isClsStyle = (v) => (v?.toString() ?? '').trim().startsWith('class'),
    isCls = (v) => anyExe(v) &&  isClsStyle(v),
    isExe = (v) => anyExe(v) && !isClsStyle(v),
;
export class Assertion {
    constructor(target) {this._={target}}
    is() {throw new Error(`プログラミングエラー。オーバーライドしてください。`)}
    expect() {throw new Error(`プログラミングエラー。オーバーライドしてください。`)}
}
//export class TypeAssertion extends Assertion{constructor(target) {this._={target}}}
export class TypeAssertion extends Assertion {
    constructor(target) {this._={target}}
    _throw() {
        throw new ValidationError(``);
    }
}
export class TypeOfAssertion extends Assertion {
    constructor(target) {super(target)}
    get p() {return new PrimitiveTypeAssertion(this._.target)}
    get r() {return new ReferenceTypeAssertion(this._.target)}
    get e() {return new ExecutableTypeAssertion(this._.target)}
    get w() {return new WebApiTypeAssertion(this._.target)}
}
export class OwnerAssertion {constructor(target) {this._={target}}}
export class OwnerOfAssertion extends OwnerAssertion {
    constructor(target) {super(target)}
    get f() {return new FieldOwnerAssertion(this._.target)}
    get m() {return new MethodOwnerAssertion(this._.target)}
    get d() {return new DescriptorOwnerAssertion(this._.target)}
}

