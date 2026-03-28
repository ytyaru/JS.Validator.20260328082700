const getId = (v) => Object.prototype.toString.call(v).slice(8, -1)
    , isPri = (v) => null === v || v !== Object(v)
    , isRef = (v) => !isPri(v)
    , isFn = (v) => 'function' === typeof v
    , isClsStyle = (v) => /^class\b/.test(v?.toString?.()?.trim() ?? '')
    , isNtvStyle = (v) => /\[native code\]/.test(v.toString())
    //, isBndStyle = (v) => v.name.startsWith('bound ') && v.hasOwnProperty('prototype')
    , isBndStyle = (v) => v.name.startsWith('bound ') && !('prototype' in v)
    , isCls = (v) => isFn(v) &&  isClsStyle(v)
    , isCal = (v) => isFn(v) && !isClsStyle(v)
    , isNtv = (v) => isCal(v) && isNtvStyle(v)
    , isBnd = (v) => isCal(v) && isNtvStyle(v) &&  isBndStyle(v)
    , isBlt = (v) => isCal(v) && isNtvStyle(v) && !isBndStyle(v)
    , AsyncFunction = (async () => {}).constructor
    , GeneratorFunction = (function* () {}).constructor
    , AsyncGeneratorFunction = (async function* () {}).constructor
    , fns = [Function,AsyncFunction,GeneratorFunction,AsyncGeneratorFunction]
    , isFun = (v, type) => isCal(v) && !isNtv(v) && v.constructor === type
    , anyFun = (v) => isCal(v) && !!v.prototype && !isNtv(v)
    , isArrOrMethod = (v) => isCal(v) && !v.prototype && !isNtv(v)
    , isArrStyle = (v) => {
        const s = v.toString().trim();
        return /^(async\s+)?(\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>/.test(s);
    }
    //, anyArrFn = (v) => isArrOrMethod(v) && isArrStyle(v)
    , anyArrFn = (v) => isArrOrMethod(v) && fns.some(c=>c===v.constructor)
    , isArrFn = (v, type) => anyArrFn(v) && v.constructor === type // getIdからコンストラクタ比較に変更
//    , isArrFn = (v, n='') => anyArrFn(v) && `${n}Function` === getId(v)
    , anyMethod = (v) => isArrOrMethod(v) && !isArrStyle(v)
//    , isMethod = (v, n='') => anyMethod(v) && `${n}Function` === getId(v)
    , isObj = (v) => Object===v?.constructor
    , pTypNms = 'Undefined Null Boolean Number BigInt String Symbol'.split(' ')
    , pClsOfNms = {Undefined:'Und', Null:'Nul', Boolean:'Bln', Number:'Num', BigInt:'Big', String:'Str', Symbol:'Sym'}
    , isAry = (v) => Array.isArray(v)
    , getDes = (o, n) => Object.getOwnPropertyDescriptor(o, n)
    , isDesV = (o, n) => {const d=getDes(o, n); return d && !isFn(d.value)} 
    , isDesC = (o, n) => {const d=getDes(o, n); return d &&  isFn(d.value)}
    , hasAcc = (o, n, g, s) => {
        const d = getDes(o, n);
        return !!(g && d?.get || !g && !d?.get) && (s && d?.set || !s && !d?.set);
    }
;
const pri = {
    isUnd: (v) => undefined===v,
    isNul: (v) => null===v,
    isBln: (v) => 'boolean'===typeof v,
    isNum: (v) => 'number'===typeof v,
    isBig: (v) => 'bigint'===typeof v,
    isStr: (v) => 'string'===typeof v,
    isSym: (v) => 'symbol'===typeof v,
};
const priOfFn = (v, c) => {
    if(!isCls(c)){throw new TypeError(`cはClassであるべきです。`)};
    const n = pTypNms.find(n=>n===c.name);
    if(!n) {throw new TypeError(`cはプリミティブ型であるべきです。実際値:${n} 期待値:${pTypNms}`)}
    return pri[`is${pClsOfNms[n]}`];
};
const insOfFn = (v, c) => {
    if(!isCls(c)){throw new TypeError(`cはClassであるべきです。`)};
    return ((v, c)=>v instanceof c);
};
export const typer = Object.freeze({
    id: getId,
    p: {
        is: isPri,
        of: (v,c) => (priOfFn(v,c))(v,c),
        und: (v) => pri.isUnd,
        nul: (v) => pri.isNul,
        bln: (v) => pri.isBln,
        num: (v) => pri.isNum,
        big: (v) => pri.isBig,
        str: (v) => pri.isStr,
        sym: (v) => pri.isSym,
    }, 
    r: {
        is: isRef,
        own: {
            cls: isCls,
            ins: {
                of: (v, c)=>v instanceof c,
                obj: isObj,
                ary: isAry,
                set: (v) => v instanceof Set, // 'Set'===getId(v),
                map: (v) => v instanceof Map, // 'Map'===getId(v),
                soloObj: (v) => isObj(v) || Object.getPrototypeOf(v) === null,
                blankObj: (v) => isObj(v) && 0===Object.keys(v).length,
                blankAry: (v) => isAry(v) && 0===v.length,
                aryOf: (v, c) => {// Array<T>
                    const fn = isPri(c) ? priOfFn(v,c) : (isCls(c) ? insOfFn(v,c) : (()=>{throw new TypeError(`cはクラスであるべきです。`)})());
                    if (!isAry(v)) {throw new TypeError(`vはArrayであるべきです。`)}
                    return v.every(e => fn(e, c));
                },
            }
        },
        itr: (v) => isRef(v) && isFn(v.next),
        gen: (v) => 'Generator' === getId(v),
        des: {
            is: (n, o) => !!getDes(o, n),
            a: {// accessor
                g: (n, o) => hasAcc(o, n, true, false),  // getter
                s: (n, o) => hasAcc(o, n, false, true),  // setter
                gs: (n, o) => hasAcc(o, n, true, true), // getter & setter
            }, 
            d: {// data
                v: (n, o) => isDesV(o, n), //value
                c: (n, o) => isDesC(o, n), //callable
            },
        },
        cal: {
            is: isCal,
            ntv: {
                is: isNtv,
                bnd: isBnd,
                blt: isBlt,
            },
            fun: {
                is: anyFun,
                f: (v) => isFun(v, Function),
                a: (v) => isFun(v, AsyncFunction),
                g: (v) => isFun(v, GeneratorFunction),
                ag: (v) => isFun(v, AsyncGeneratorFunction),
            },
            arw: {
                is: anyArrFn,
                f: (v) => isArrFn(v),
                a: (v) => isArrFn(v, 'Async'),
            },
            met: {
                is: anyMethod,
                f: (v) => isMethod(v),
                a: (v) => isMethod(v, 'Async'),
                g: (v) => isMethod(v, 'Generator'),
                ag: (v) => isMethod(v, 'AsyncGenerator'),
            },
        },
        err: {
            cls: (v) => isCls(v) && (v.prototype instanceof Error || v === Error),
            ins: (v) => v instanceof Error, // getId(v).endsWith('Error')
        },
    },
});

