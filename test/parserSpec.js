describe('parser', function () {

    describe('pLit', function () {
        it('should ignore an empty token list', function () {
            var parser = pLit('stuff');
            var result = parser(empty());
            expect(result).toBe(empty());
        });

        it('should consume a matching token', function () {
            var toks = clex(fromArray('test string'));
            var parser = pLit('test');
            var result = parser(toks);
            expect(toArray(result)).toEqual([{
                result: 'test',
                rest: tail(toks)
            }]);
        });

        it('should ignore a non-matching token', function () {
            var toks = clex(fromArray('test string'));
            var parser = pLit('stuff');
            var result = parser(toks);
            expect(toArray(result)).toEqual([]);
        });
    });

    describe('pAlt', function () {
        it('should return the results of the first parser if it matches', function () {
            var toks = clex(fromArray('test string'));
            var parser = pAlt(pLit('test'), pLit('blah'));
            var result = parser(toks);
            expect(toArray(result)).toEqual([{
                result: 'test',
                rest: tail(toks)
            }]);
        })

        it('should return the results of the second parser if it matches', function () {
            var toks = clex(fromArray('test string'));
            var parser = pAlt(pLit('blah'), pLit('test'));
            var result = parser(toks);
            expect(toArray(result)).toEqual([{
                result: 'test',
                rest: tail(toks)
            }]);
        })
    });

    describe('pThen', function () {
        it('should return nothing if the first parser fails', function () {
            var toks = clex(fromArray('test string'));
            var parser = pThen(null, pLit('blah'), pLit('string'));
            var result = parser(toks);
            expect(result).toBe(empty());
        });

        it('should return nothing if the second parser fails', function () {
            var toks = clex(fromArray('test string'));
            var parser = pThen(null, pLit('test'), pLit('blah'));
            var result = parser(toks);
            expect(result).toBe(empty());
        });

        it('should return a combined result if both parsers succeed', function () {
            var toks = clex(fromArray('test string'));
            var parser = pThen(add, pLit('test'), pLit('string'));
            var result = parser(toks);
            expect(toArray(result)).toEqual([{
                result: 'teststring',
                rest: empty()
            }]);
        });
    });

    describe('pEmpty', function () {
        it('should return the correct result', function () {
            var toks = clex(fromArray('test string'));
            var parser = pEmpty(1);
            var result = parser(toks);
            expect(toArray(result)).toEqual([{
                result: 1,
                rest: toks
            }]);
        });
    });

    describe('pOneOrMore', function () {
        it('should handle an empty list', function () {
            var toks = empty();
            var parser = pOneOrMore(pLit('x'));
            var result = parser(toks);
            expect(result).toBe(empty());
        });

        it('should ignore zero occurences', function () {
            var toks = clex(fromArray('test'));
            var parser = pOneOrMore(pLit('x'));
            var result = parser(toks);
            expect(result).toBe(empty());
        });

        it('should handle one occurence', function () {
            var toks = clex(fromArray('x test'));
            var parser = pOneOrMore(pLit('x'));
            var result = parser(toks);
            expect(result).toEqual(fromArray([{
                result: fromArray(['x']),
                rest: tail(toks)
            }]));
        });

        it('should handle three occurences', function () {
            var toks = clex(fromArray('x x x test'));
            var parser = pOneOrMore(pLit('x'));
            var result = parser(toks);

            expect(result).toEqual(fromArray([
            {
                result: fromArray(['x']),
                rest: fromArray(['x', 'x', 'test'])
            },
            {
                result: fromArray(['x', 'x', 'x']),
                rest: fromArray(['test'])
            },
            {
                result: fromArray(['x', 'x']),
                rest: fromArray(['x', 'test'])
            }
            ]));
        });
    });

    describe('pSat', function () {
        it('should ignore an empty token list', function () {
            var parser = pSat(partial(eq, 'test'));
            var result = parser(empty());

            expect(result).toBe(empty());
        });

        it('should parse a token which matches', function () {
            var toks = clex(fromArray('test'));
            var parser = pSat(partial(eq, 'test'));
            var result = parser(toks);

            expect(result).toEqual(fromArray([{
                result: 'test',
                rest: empty()
            }]));
        });

        it('should ignore a token which does not match', function () {
            var toks = clex(fromArray('toast'));
            var parser = pSat(partial(eq, 'test'));
            var result = parser(toks);

            expect(result).toBe(empty());
        });
    });

    describe('pApply', function () {
        it('should apply a function to a parser result', function () {
            var toks = clex(fromArray('1'));
            var parser = pApply(parseInt, pLit('1'));
            var result = parser(toks);

            expect(result).toEqual(fromArray([{
                result: 1,
                rest: empty()
            }]));
        });
    });

    describe('pNum', function () {
        it('should parse a list of numbers', function () {
            var toks = clex(fromArray('1.5 44 124'));
            var parser = pOneOrMore(pNum);
            var result = parser(toks);

            expect(result).toEqual(fromArray([{
                result: fromArray([1.5]),
                rest: fromArray(['44', '124'])
            }, {
                result: fromArray([1.5, 44, 124]),
                rest: empty()
            }, {
                result: fromArray([1.5, 44]),
                rest: fromArray(['124'])
            }]));
        });
    });
});
