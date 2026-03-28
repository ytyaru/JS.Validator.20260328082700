import {TypeAssertion, isPri, isRef} from './lib/type.js';
class PrimitiveTypeAssertion extends TypeAssertion {
    constructor(target) {super(target)}
    get und() {return }
    get nul() {}
    get bln() {}
    get num() {}
    get big() {}
    get str() {}
    get sym() {}
}
