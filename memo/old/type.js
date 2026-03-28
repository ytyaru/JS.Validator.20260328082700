const getId = (v) => Object.prototype.toString.call(v).slice(8, -1)
    , isPri = (v) => null === v || v !== Object(v)
    , isRef = (v) => !Pri(v)
    , isFn = (v) => 'function' === typeof v
    , isClsStyle = (v) => /^class\b/.test(v?.toString?.()?.trim() ?? '')
    , isNtvStyle = (v) => /\[native code\]/.test(v.toString())
    , isBndStyle = (v) => v.name.startsWith('bound ') && v.hasOwnProperty('prototype')
    , isCls = (v) => isFn(v) &&  isClsStyle(v)
    , isCal = (v) => isFn(v) && !isClsStyle(v)
    , isNtv = (v) => isCal(v) && isNtvStyle(v)
    , isBnd = (v) => isCal(v) && isNtvStyle(v) &&  isBndStyle(v)
    , isBlt = (v) => isCal(v) && isNtvStyle(v) && !isBndStyle(v)
    , isFun = (v, n='') =>isCal(v) && `${n}Function`===getId(v),
    , isArrOrMethod = (v) => isCal(v) && !v.prototype && !isBnd(v);
    , isArrStyle = (v) => {
        const s = v.toString().trim();
        return /^(async\s+)?(\([^)]*\)|[a-zA-Z_$][\w$]*)\s*=>/.test(s);
    }
    , anyArrFn = (v) => isArrOrMethod(v) && isArrStyle(v)
    , isArrFn(v, n='') => anyArrFn(v) && `${n}Function` === getId(v)
    , anyMethod = (v) => isArrOrMethod(v) && !isArrStyle(v);
    , isMethod    = (v) => 'Function' === getId(v) && anyMethod(v);
    , isAMethod   = (v) => 'AsyncFunction' === getId(v) && anyMethod(v);
    , isGMethod   = (v) => 'GeneratorFunction' === getId(v) && anyMethod(v);
    , isAGMethod  = (v) => 'AsyncGeneratorFunction' === getId(v) && anyMethod(v);
    , isObj = (v) => Object===v?.constructor
    , pTypNms = 'Undefind Null Boolean Number BigInt String Symbol'.split(' '),
    , pClsOfNms = {Undefind:'Und', Null:'Nul', Boolean:'Bln', Number:'Num', BigInt:'Big', String:'Str', Symbol:'Sym'}
	, isAry = (v) => Array.isArray(v)
    , getDes = (o, n)=>Object.getOwnPropertyDescriptor(o, n)
    , isDesV = (o, n)=>{const d=getDes(o, n); return d && !isFn(d.value)} 
    , isDesC = (o, n)=>{const d=getDes(o, n); return d && !isFn(d.value)}
    , hasAcc = (o, n, g, s) => {
        const d = getDes(o, n);
        return !!(g && d?.get || !g && !d?.get) && (s && d?.set || !s && !d?.set);
    },
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
	cont n = pTypNms.find(n=>n===c.name);
	if(!n) {throw new TypeError(`cはプリミティブ型であるべきです。実際値:${n} 期待値:${pTypNms}`)}
	return pri[`is${n}`];
};
const insOfFn = (v, c) => {
	if(!isCls(c)){throw new TypeError(`cはClassであるべきです。`)};
	return ((v, c)=>v instanceof c);
};
export const typer = Object.freeze({
	id: getId,
	p: {
		is: isPri,
		of: priOf,
		und:(v)=>pri.isUnd,
		nul:(v)=>pri.isNul,
		bln:(v)=>pri.isBln,
		num:(v)=>pri.isNum,
		big:(v)=>pri.isBig,
		str:(v)=>pri.isStr,
		sym:(v)=>pri.isSym,
	}, 
	r: {
		is: isRef,
		own: {
			cls: isCls,
			ins: {
				of: (v, c)=>v instanceof c,
				obj: isObj,
				ary: isAry,
				set: (v)=>v instanceof Set, // 'Set'===getId(v),
				map: (v)=>v instanceof Map, // 'Map'===getId(v),
				soloObj: (v)=>isObj(v) || Object.getPrototypeOf(v) === null,
				blankObj: (v)=>isObj(v) && 0===Object.keys(v).length,
				blankAry: (v)=>isAry(v) && 0===v.length,
				aryOf: (v, c)=>{// Array<T>
					const fn = isPri(c) ? priOfFn(v,c) : (isCls(c) ? insOfFn(v,c) : (()=>{throw new TypeError(`cはクラスであるべきです。`)})());
					if (!isAry(v)) {throw new TypeError(`vはArrayであるべきです。`)}
					return v.every(e=>fn(e, c));
				},
			}
		},
		itr: (v)=>isRef(v) && isFn(v.next),
		gen: (v)=>'Generator' === getId(v),
		des: {
			is: (n, o)=>Object.getOwnPropertyDescriptor(o, n),
			a: {// accessor
				g: (n, o)=>hasAcc(o, n, true, false),  // getter
				s: (n, o)=>hasAcc(o, n, false, true),  // setter
				gs: (n, o)=>hasAcc(o, n, true, true), // getter & setter
			}, 
			d: {// data
				v: (n, o)=>isDesV(o, n), //value
				c: (n, o)=>isDesC(o, n), //callable
			}
		}
		cal: {
			is: isCal,
			ntv: {
				is: isNtv,
				bnd: isBnd,
				blt: isBlt,
			},
			fun: {
				is:(v)=>isCal(v) && (!!v.prototype || isBnd(v)),
				f:(v)=>isFun(v),
				a:(v)=>isFun(v, 'Async'),
				g:(v)=>isFun(v, 'Generator'),
				ag:(v)=>isFun(v, 'AsyncGenerator'),
			},
			arw: {
				is: anyArrFn,
				f: (v) => isArrFn(v),
				a: (v) => isArrFn(v, 'Async'),
			},
			met: {
				is: anyMethod,
				f: isMethod,
				a: isAMethod,
				g: isGMethod,
				ag: isAGMethod,
			},
		},
		err: {
			cls: (v)=>isCls(v) && (v.prototype instanceof Error || v === Error),
			ins: (v)=>v instanceof Error, // getId(v).endsWith('Error')
		},
	},
});

