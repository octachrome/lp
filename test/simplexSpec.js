describe('simplex', function () {
    describe('solution', function () {
        it('should set up the initial solution', function () {
            var prob = {
                constraints: [
                    {
                        expr: [{sym: 'a', coef: 1}, {sym: 'x', coef: 1}, {sym: '_s0', coef: -1}],
                        op: '=',
                        rhs: 14,
                        slackVar: '_s0'
                    },
                    {
                        expr: [{sym: 'b', coef: 1}, {sym: 'y', coef: 1}, {sym: '_s1', coef: 1}],
                        op: '=',
                        rhs: 5,
                        slackVar: '_s1'
                    }
                ],
                objective: {
                    expr: [{sym: 'x', coef: -1}, {sym: 'y', coef: -1}, {sym: '_obj', coef: 1}],
                    objVar: '_obj'
                }
            };

            var mat = toMatrix(prob);
            var sol = solution(prob, mat);

            expect(sol).toEqual({
                '_s0': -14,
                '_s1': 5
            });
        });
    });

    describe('pivotVar', function () {
        it('should select the correct pivot variable', function () {
            var mat = {
                vars: ['a', 'b', 'c', 'd', 'e'],
                varIndices: {},
                rows: [
                    [],
                    [1, -4, 2, -1, 5]
                ],
                rhs: []
            };

            var pv = pivotVar(mat);
            expect(pv).toEqual({
                sym: 'b',
                index: 1
            });
        });

        it('should return null if there is no appropriate pivot variable', function () {
            var mat = {
                vars: ['a', 'b', 'c', 'd', 'e'],
                varIndices: {},
                rows: [
                    [],
                    [1, 0, 2, 1, 0]
                ],
                rhs: []
            };

            var pv = pivotVar(mat);
            expect(pv).toBe(null);
        });
    });

    describe('pivotRow', function () {
        it('should select the correct pivot row', function () {
            var mat = {
                vars: ['a'],
                varIndices: {},
                rows: [
                    [1],
                    [0],
                    [2],
                    [3],
                    [-1]
                ],
                rhs: [4, 1, 6, 10, 1]
            };

            var pv = {
                sym: 'a',
                index: 0
            };
            var pr = pivotRow(mat, pv);
            expect(pr).toBe(2);
        });

        it('should return null if no pivot row candidates', function () {
            var mat = {
                vars: ['a'],
                varIndices: {},
                rows: [
                    [0],
                    [-1]
                ],
                rhs: [1, 1]
            };

            var pv = {
                sym: 'a',
                index: 0
            };
            var pr = pivotRow(mat, pv);
            expect(pr).toBe(null);
        });
    });

    function isMultipleOf(actual, expected, scaleFactor) {
        var ratio = null;
        if (actual.length === expected.length) {
            for (var i = 0; i < expected.length; i++) {
                var a = actual[i];
                var e = expected[i];
                if (e === 0) {
                    if (a !== 0) {
                        return { pass: false };
                    }
                } else if (ratio === null) {
                    ratio = a / e;
                } else {
                    var r = a / e;
                    if (r !== ratio) {
                        return { pass: false };
                    }
                }
            }
        }
        return { pass: true };
    }

    describe('isMultipleOf', function () {
        it('should pass if a row is a multiple of another', function () {
            var result = isMultipleOf([1, 2, 3], [2, 4, 6]);
            expect(result.pass).toBe(true);
        });

        it('should pass if a row is negative another', function () {
            var result = isMultipleOf([1, 2, 3], [-1, -2, -3]);
            expect(result.pass).toBe(true);
        });

        it('should fail if a row is not a multiple of another', function () {
            var result = isMultipleOf([1, 2, 3], [3, 4, 5]);
            expect(result.pass).toBe(false);
        });

        it('should fail if a row is a multiple of another except for actual zeros', function () {
            var result = isMultipleOf([1, 2, 3, 0], [2, 4, 6, 8]);
            expect(result.pass).toBe(false);
        });

        it('should fail if a row is a multiple of another except for expected zeros', function () {
            var result = isMultipleOf([1, 2, 3, 4], [2, 4, 6, 0]);
            expect(result.pass).toBe(false);
        });
    });

    describe('pivot', function () {

        beforeEach(function () {
            jasmine.addMatchers({
                toBeMultipleOf: function () {
                    return {
                        compare: isMultipleOf
                    };
                }
            })
        });

        it('should pivot a matrix on the given variable and row', function () {
            var mat = {
                vars: ['x', 'y', 'z', 's', 't', 'u', 'p'],
                rows: [
                    [0, -3,   1,   1,   3,   0,   0],
                    [4,  1,   0,   0,   1,   0,   0],
                    [0,  1,   0, -10,   0,   2,   0],
                    [0,  3,   0,   0,  -4,   0,   5]
                ],
                rhs: [
                    3,
                    10,
                    10,
                    15
                ]
            };

            var pivoted = pivot(mat, 0, 4);

            expect(augmentedRow(pivoted, 0)).toEqual([0,  -3,   1,   1,   3,   0,   0,   3]);
            expect(augmentedRow(pivoted, 1)).toBeMultipleOf([12,  6,  -1,  -1,   0,   0,   0,  27]);
            expect(augmentedRow(pivoted, 2)).toEqual([0,   1,   0, -10,   0,   2,   0,  10]);
            expect(augmentedRow(pivoted, 3)).toBeMultipleOf([0,  -3,   4,   4,   0,   0,  15,  57]);
        });
    });
});
