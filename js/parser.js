function pLit(lit) {
    return function (tokens) {
        if (tokens === empty()) {
            return empty();
        }
        if (head(tokens) === lit) {
            return cons({
                result: lit,
                rest: tail(tokens)
            });
        }
        return empty();
    };
}

function pAlt(/*p1, p2, ...*/) {
    var parsers = arguments;
    return function (tokens) {
        return flatMap(function (p) {
            return p(tokens);
        }, fromArray(parsers));
    };
}

function pThen(combine, p1, p2) {
    return function (tokens) {
        var results1 = p1(tokens);
        var results = empty();

        each(results1, function (r1) {
            var results2 = p2(r1.rest);

            each(results2, function (r2) {
                results = cons({
                    result: combine(r1.result, r2.result),
                    rest: r2.rest
                }, results);
            });
        });
        return results;
    };
}

function pEmpty(result) {
    return function (tokens) {
        return cons({
            result: result,
            rest: tokens
        });
    };
}

function pZeroOrMore(p) {
    return pAlt(pOneOrMore(p), pEmpty(empty()));
}

function pOneOrMore(p) {
    // Second parser must be lazy to avoid eager (infinite) recursion.
    return pThen(cons, p, function (tokens) {
        return pZeroOrMore(p)(tokens);
    });
}

function pSat(predicate) {
    return function (tokens) {
        if (tokens === empty()) {
            return empty();
        }
        var h = head(tokens);
        if (predicate(h)) {
            return cons({
                result: h,
                rest: tail(tokens)
            });
        } else {
            return empty();
        }
    }
}

function pApply(p, fn) {
    return function (tokens) {
        var results = p(tokens);
        return map(function (result) {
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
