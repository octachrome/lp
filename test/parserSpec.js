describe('parser', function () {

    var c, l, clex, p;

    beforeEach(function() {
        c = require('../js/core');
        l = require('../js/list');
        clex = require('../js/lex').clex;
        p = require('../js/parser');
    });

    describe('pLit', function () {
        it('should ignore an empty token list', function () {
            var parser = p.pLit('stuff');
            var result = parser(l.empty());
            expect(result).toBe(l.empty());
        });

        it('should consume a matching token', function () {
            var toks = clex(l.fromArray('test string'));
            var parser = p.pLit('test');
            var result = parser(toks);
            expect(l.toArray(result)).toEqual([{
                result: 'test',
                rest: l.tail(toks)
            }]);
        });

        it('should ignore a non-matching token', function () {
            var toks = clex(l.fromArray('test string'));
            var parser = p.pLit('stuff');
            var result = parser(toks);
            expect(l.toArray(result)).toEqual([]);
        });
    });

    describe('pAlt', function () {
        it('should return the results of the first parser if it matches', function () {
            var toks = clex(l.fromArray('test string'));
            var parser = p.pAlt(p.pLit('test'), p.pLit('blah'));
            var result = parser(toks);
            expect(l.toArray(result)).toEqual([{
                result: 'test',
                rest: l.tail(toks)
            }]);
        })

        it('should return the results of the second parser if it matches', function () {
            var toks = clex(l.fromArray('test string'));
            var parser = p.pAlt(p.pLit('blah'), p.pLit('test'));
            var result = parser(toks);
            expect(l.toArray(result)).toEqual([{
                result: 'test',
                rest: l.tail(toks)
            }]);
        })
    });

    describe('pThen', function () {
        it('should return nothing if the first parser fails', function () {
            var toks = clex(l.fromArray('test string'));
            var parser = p.pThen(null, p.pLit('blah'), p.pLit('string'));
            var result = parser(toks);
            expect(result).toBe(l.empty());
        });

        it('should return nothing if the second parser fails', function () {
            var toks = clex(l.fromArray('test string'));
            var parser = p.pThen(null, p.pLit('test'), p.pLit('blah'));
            var result = parser(toks);
            expect(result).toBe(l.empty());
        });

        it('should return a combined result if both parsers succeed', function () {
            var toks = clex(l.fromArray('test string'));
            var parser = p.pThen(c.add, p.pLit('test'), p.pLit('string'));
            var result = parser(toks);
            expect(l.toArray(result)).toEqual([{
                result: 'teststring',
                rest: l.empty()
            }]);
        });

        it('should combine three parsers', function () {
            var toks = clex(l.fromArray('a a b c c c'));
            var parser = p.pThen(l.fromArgs, p.pOneOrMore(p.pLit('a')), p.pOneOrMore(p.pLit('b')), p.pOneOrMore(p.pLit('c')));
            var result = p.takeFirstParse(parser(toks));
            expect(l.toArray(result)).toEqual([
                l.fromArray(['a', 'a']),
                l.fromArray(['b']),
                l.fromArray(['c', 'c', 'c'])
            ]);
        });
    });

    describe('pEmpty', function () {
        it('should return the correct result', function () {
            var toks = clex(l.fromArray('test string'));
            var parser = p.pEmpty(1);
            var result = parser(toks);
            expect(l.toArray(result)).toEqual([{
                result: 1,
                rest: toks
            }]);
        });
    });

    describe('pOneOrMore', function () {
        it('should handle an empty list', function () {
            var toks = l.empty();
            var parser = p.pOneOrMore(p.pLit('x'));
            var result = parser(toks);
            expect(result).toBe(l.empty());
        });

        it('should ignore zero occurences', function () {
            var toks = clex(l.fromArray('test'));
            var parser = p.pOneOrMore(p.pLit('x'));
            var result = parser(toks);
            expect(result).toBe(l.empty());
        });

        it('should handle one occurence', function () {
            var toks = clex(l.fromArray('x test'));
            var parser = p.pOneOrMore(p.pLit('x'));
            var result = parser(toks);
            expect(result).toEqual(l.fromArray([{
                result: l.fromArray(['x']),
                rest: l.tail(toks)
            }]));
        });

        it('should handle three occurences', function () {
            var toks = clex(l.fromArray('x x x test'));
            var parser = p.pOneOrMore(p.pLit('x'));
            var result = parser(toks);

            expect(result).toEqual(l.fromArray([
            {
                result: l.fromArray(['x']),
                rest: l.fromArray(['x', 'x', 'test'])
            },
            {
                result: l.fromArray(['x', 'x', 'x']),
                rest: l.fromArray(['test'])
            },
            {
                result: l.fromArray(['x', 'x']),
                rest: l.fromArray(['x', 'test'])
            }
            ]));
        });
    });

    describe('pSat', function () {
        it('should ignore an empty token list', function () {
            var parser = p.pSat(c.partial(c.eq, 'test'));
            var result = parser(l.empty());

            expect(result).toBe(l.empty());
        });

        it('should parse a token which matches', function () {
            var toks = clex(l.fromArray('test'));
            var parser = p.pSat(c.partial(c.eq, 'test'));
            var result = parser(toks);

            expect(result).toEqual(l.fromArray([{
                result: 'test',
                rest: l.empty()
            }]));
        });

        it('should ignore a token which does not match', function () {
            var toks = clex(l.fromArray('toast'));
            var parser = p.pSat(c.partial(c.eq, 'test'));
            var result = parser(toks);

            expect(result).toBe(l.empty());
        });
    });

    describe('pApply', function () {
        it('should apply a function to a parser result', function () {
            var toks = clex(l.fromArray('1'));
            var parser = p.pApply(p.pLit('1'), parseInt);
            var result = parser(toks);

            expect(result).toEqual(l.fromArray([{
                result: 1,
                rest: l.empty()
            }]));
        });
    });
});
