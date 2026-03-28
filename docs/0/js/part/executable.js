import {TypeAssertion, isPri, isRef, anyExe, isClsStyle, isCls, isExe} from './lib/type.js';
const isBoundFn = (v) => isExe(v) && v.name.startsWith('bound ') && !v.hasOwnProperty('prototype'),
    isArrOrMethod = (v) => isExe(v) && !v.prototype && !isBoundFn(v),
    isArrStyle = (v) => {
        const s = v.toString().trim();
        return /^(async\s+)?(\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>/.test(s);
    },
    anyMethod = (v) => isArrOrMethod(v) && !isArrStyle(v),
;
class ExecutableTypeAssertion extends TypeAssertion {
    constructor(target) {super(target)}
    get label() {return '実行可能'}
    is() {return isExe(this._.target)}
    expect() {}
    get fun() {return new FunctionTypeAssertion(this._.target)}
    get arw() {return new ArrowFunctionTypeAssertion(this._.target)}
    get met() {return new MethodTypeAssertion(this._.target)}
    get bou() {return new BoundFunctionTypeAssertion(this._.target)}
    get nat() {return new NativeCodeTypeAssertion(this._.target)}
}
class FunctionableTypeAssertion extends TypeAssertion {
    constructor(target) {super(target); this._.isAsync=false; this._.isGenerator=false;}
    get a() {this._.isAsync=true; return this;}
    get g() {this._.isGenerator=true; return this;}
}
class FunctionTypeAssertion extends FunctionableTypeAssertion {
    constructor(target) {super(target);}
    is() {}
    expect() {}
}
class ArrowFunctionTypeAssertion extends TypeAssertion {
    constructor(target) {super(target); this._.isAsync=false; this._.isGenerator=false;}
    is() {}
    expect() {}
    get a() {this._.isAsync=true; return this;}
    get g() {this._.isGenerator=true; return this;}


}
class BoundFunctionTypeAssertion extends TypeAssertion {
    constructor(target) {super(target); this._.isAsync=false; this._.isGenerator=false;}
    is() {}
    expect() {}
    get a() {this._.isAsync=true; return this;}
    get g() {this._.isGenerator=true; return this;}


}
class NativeCodeFunctionTypeAssertion extends TypeAssertion {
    constructor(target) {super(target); this._.isAsync=false; this._.isGenerator=false;}
    is() {}
    expect() {}
    get a() {this._.isAsync=true; return this;}
    get g() {this._.isGenerator=true; return this;}


}

class MethodTypeAssertion extends FunctionableTypeAssertion {
    constructor(target) {super(target); this._.isAsync=false; this._.isGenerator=false;}
    is() {
        const v = this._.target;
        if (this._.isAsync) {
            if (this._.isGenerator) {}
        } else {
            if (this._.isGenerator) {}
            else {return isArrOrMethod(v) && !isArrStyle(v)}
        }
    }
    expect() {}
    get a() {this._.isAsync=true; return this;}
    get g() {this._.isGenerator=true; return this;}
}



