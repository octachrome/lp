describe('lp parser', function () {
    beforeEach(function () {
        createLpParser();
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

    describe('pExpr', function () {
        it('should parse a signed term', function () {
            var toks = clex(fromArray('-1.4x'));
            var result = pSignedTerm(toks);

            expect(result).toEqual(fromArray([{
                result: {
                    sym: 'x',
                    coef: -1.4
                },
                rest: empty()
            }]));
        });

        it('should parse a large signed term', function () {
            var toks = clex(fromArray('+ 99 y'));
            var result = pSignedTerm(toks);

            expect(result).toEqual(fromArray([{
                result: {
                    sym: 'y',
                    coef: 99
                },
                rest: empty()
            }]));
        });

        it('should parse a sequence of signed terms', function () {
            var toks = clex(fromArray('-1.4x + y - 2 z'));
            var result = pExpr(toks);

            // three different ways to consume one or more terms
            expect(length(result)).toBe(3);

            var r = nth(1, result);
            expect(r).toEqual({
                result: fromArray([{
                    sym: 'x',
                    coef: -1.4
                },{
                    sym: 'y',
                    coef: 1
                },{
                    sym: 'z',
                    coef: -2
                }]),
                rest: empty()
            });
        });

        it('should parse an expression without an initial sign', function () {
            var toks = clex(fromArray('1.4x + y - 2 z'));
            var result = pExpr(toks);

            // three different ways to consume one or more terms
            expect(length(result)).toBe(3);

            var r = takeFirstParse(result);
            expect(r).toEqual(fromArray([{
                sym: 'x',
                coef: 1.4
            },{
                sym: 'y',
                coef: 1
            },{
                sym: 'z',
                coef: -2
            }]));
        });

        it('should parse a constraint', function () {
            var toks = clex(fromArray('12 var1 - var2 >= 4'));
            var result = pConstraint(toks);
            expect(takeFirstParse(result)).toEqual({
                expr: [{sym: 'var1', coef: 12}, {sym: 'var2', coef: -1}],
                op: '>=',
                rhs: 4
            });
        });

        it('should parse a constraint with a signed rhs', function () {
            var toks = clex(fromArray('12 var1 - var2 >= -4'));
            var result = pConstraint(toks);
            expect(takeFirstParse(result)).toEqual({
                expr: [{sym: 'var1', coef: 12}, {sym: 'var2', coef: -1}],
                op: '>=',
                rhs: -4
            });
        });

        it('should parse a named constraint', function () {
            var toks = clex(fromArray('cons1: 12 var1 - var2 >= -4'));
            var result = pConstraint(toks);
            expect(takeFirstParse(result)).toEqual({
                name: 'cons1',
                expr: [{sym: 'var1', coef: 12}, {sym: 'var2', coef: -1}],
                op: '>=',
                rhs: -4
            });
        });
    });
});
