import {TypeAssertion, isCls, isPri, isRef} from './lib/type.js';
class ReferenceTypeAssertion extends TypeAssertion {
    constructor(target) {super(target)}
    get mod() {return }
    get cls() {return } // cla
    get ins() {return }
    get obj() {return }
    get ary() {return } // arr
    get map() {return }
    get set() {return }
    get itr() {return } // ite
    get gen() {return } // gen

    get mod() {return }
    get mod() {return }
    get und() {return }
    get nul() {}
    get bln() {}
    get num() {}
    get big() {}
    get str() {}
    get sym() {}
}
