if (typeof exports === 'undefined') {
    var exports = window.parser = {};
}

(function (exports) {
    var l = require('./list');

    function pLit(lit) {
        return function (tokens) {
            if (tokens === l.empty()) {
                return l.empty();
            }
            if (l.head(tokens) === lit) {
                return l.cons({
                    result: lit,
                    rest: l.tail(tokens)
                });
            }
            return l.empty();
        };
    }

    function pAlt(/*p1, p2, ...*/) {
        var parsers = arguments;
        return function (tokens) {
            return l.flatMap(function (p) {
                return p(tokens);
            }, l.fromArray(parsers));
        };
    }

    function pThen(combine /*, p1, p2, ...*/) {
        var args = Array.prototype.slice.apply(arguments);
        return function (tokens) {
            var results = l.empty();

            function f(toks, idx, a) {
                var p = args[idx];
                var r = p(toks);
                l.each(r, function (rr) {
                    var b = a.concat(rr.result);
                    if (idx === args.length - 1) {
                        results = l.cons({
                            result: combine.apply(null, b),
                            rest: rr.rest
                        }, results);
                    } else {
                        f(rr.rest, idx + 1, b);
                    }
                });
            }
            f(tokens, 1, []);
            return results;
        };
    }

    function pThen3(combine, p1, p2, p3) {
        return function (tokens) {
            var results1 = p1(tokens);
            var results = l.empty();

            l.each(results1, function (r1) {
                var results2 = p2(r1.rest);

                l.each(results2, function (r2) {
                    var results3 = p3(r2.rest);

                    l.each(results3, function (r3) {
                        results = l.cons({
                            result: combine(r1.result, r2.result, r3.result),
                            rest: r3.rest
                        }, results);
                    });
                });
            });
            return results;
        };
    }

    function pEmpty(result) {
        return function (tokens) {
            return l.cons({
                result: result,
                rest: tokens
            });
        };
    }

    function pZeroOrMore(p) {
        return pAlt(pOneOrMore(p), pEmpty(l.empty()));
    }

    function pOneOrMore(p) {
        // Second parser must be lazy to avoid eager (infinite) recursion.
        return pThen(l.cons, p, function (tokens) {
            return pZeroOrMore(p)(tokens);
        });
    }

    function pZeroOrMoreFlatten(p) {
        return pAlt(pOneOrMoreFlatten(p), pEmpty(l.empty()));
    }

    function pOneOrMoreFlatten(p) {
        // Second parser must be lazy to avoid eager (infinite) recursion.
        return pThen(l.concat, p, function (tokens) {
            return pZeroOrMoreFlatten(p)(tokens);
        });
    }

    function pSat(predicate) {
        return function (tokens) {
            if (tokens === l.empty()) {
                return l.empty();
            }
            var h = l.head(tokens);
            if (predicate(h)) {
                return l.cons({
                    result: h,
                    rest: l.tail(tokens)
                });
            } else {
                return l.empty();
            }
        }
    }

    function pApply(p, fn) {
        return function (tokens) {
            var results = p(tokens);
            return l.map(function (result) {
                return {
                    result: fn(result.result),
                    rest: result.rest
                }
            }, results);
        }
    }

    function pMaybe(p) {
        return pAlt(p, pEmpty());
    }

    function takeFirstParse(parses) {
        if (parses === l.empty()) {
            throw new Error('Syntax error');
        }
        var h = l.head(parses);
        if (h.rest === l.empty()) {
            return h.result;
        }
        return takeFirstParse(l.tail(parses));
    }

    exports.pLit = pLit;
    exports.pAlt = pAlt;
    exports.pThen = pThen;
    exports.pThen3 = pThen3;
    exports.pEmpty = pEmpty;
    exports.pZeroOrMore = pZeroOrMore;
    exports.pOneOrMore = pOneOrMore;
    exports.pZeroOrMoreFlatten = pZeroOrMoreFlatten;
    exports.pOneOrMoreFlatten = pOneOrMoreFlatten;
    exports.pSat = pSat;
    exports.pApply = pApply;
    exports.pMaybe = pMaybe;
    exports.takeFirstParse = takeFirstParse;

})(exports);
