describe('simplex', function () {
    beforeEach(function () {
        createLpParser();
    });

    describe('solution', function () {
        it('should solve for all variables', function () {
            var mat = {
                vars: ['x', 'y', 'z', 's', 't', 'u', 'p'],
                rows: [
                    [2, -3,   1,   1,   3,   0,   0],
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

            var sol = solution(mat);

            expect(sol).toEqual({
                'x': 0,
                'y': 0,
                'z': 3,
                's': 0,
                't': 0,
                'u': 5,
                'p': 3
            });
        });

        it('should pick the first variable when there is a choice of two for a given row', function () {
            var mat = {
                vars: ['x', 'y', 'z', 's', 't', 'u', 'p'],
                rows: [
                    [2, -3,   1,   1,   3,   0,   0],
                    [0,  1,   0,   0,   1,   0,   0],
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

            var sol = solution(mat);

            expect(sol).toEqual({
                'x': 1.5,
                'y': 0,
                'z': 0,
                's': 0,
                't': 0,
                'u': 5,
                'p': 3
            });
        });

        it('should assign a var to zero if the column is zeroed', function () {
            var mat = {
                vars: ['x', 'y', 'z', 's', 't', 'u', 'p'],
                rows: [
                    [0, -3,   0,   1,   3,   0,   0],
                    [0,  1,   0,   0,   1,   0,   0],
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

            var sol = solution(mat);

            expect(sol).toEqual({
                'x': 0,
                'y': 0,
                'z': 0,
                's': 0,
                't': 0,
                'u': 5,
                'p': 3
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
                col: 1
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
                col: 0
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
                col: 0
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

            for (var i = 0; i < pivoted.rhs.length; i++) {
                var rhs = pivoted.rhs[i];
                expect(rhs).not.toBeLessThan(0);
            }
        });
    });

    describe('firstInfeasibility', function () {
        it('should return null if solution is feasible', function () {
            var mat = {
                vars: ['a', 'b', 'c', 'd'],
                varIndices: {},
                rows: [
                    [1,  0,  4,  0],
                    [1,  3,  0,  0],
                    [1,  0,  0,  1],
                    [1,  0, -8,  0]
                ],
                rhs: [1, 1, 1, 1]
            };

            var inf = firstInfeasibility(mat);
            expect(inf).toBe(null);
        });

        it('should return the first infeasible row', function () {
            var mat = {
                vars: ['a', 'b', 'c', 'd'],
                varIndices: {},
                rows: [
                    [1,  0,  4,  0],
                    [1, -3,  2,  0],
                    [1,  0,  0, -1],
                    [1,  0, -8,  0]
                ],
                rhs: [1, 1, 1, 1]
            };

            var inf = firstInfeasibility(mat);
            expect(inf).toEqual({
                row: 1,
                col: 2,
                sym: 'c'
            });
        });
    });

    describe('full solve', function () {
        it('should solve a simple problem', function () {
            var prob = readProb(
                "maximise\n\
                7x + 5y\n\
                subject to\n\
                2x + y <= 100\n\
                4x + 3y <= 240\n\
                end\n"
            );
            var mat = toMatrix(prob);
            var finalMat = solve(mat);
            var sol = solution(finalMat);

            expect(sol.x).toBe(30);
            expect(sol.y).toBe(40);
            expect(sol._obj).toBeCloseTo(410);
        });

        it('should solve a problem which is initially infeasible', function () {
            var prob = readProb(
                "maximise\n\
                2x + 3y + z\n\
                subject to\n\
                x + y + z <= 40\n\
                2x + y - z >= 10\n\
                -y + z >= 10\n\
                end\n"
            );
            var mat = toMatrix(prob);
            var finalMat = solve(mat);
            var sol = solution(finalMat);

            expect(sol.x).toBe(10);
            expect(sol.y).toBe(10);
            expect(sol.z).toBe(20);
            expect(sol._obj).toBe(70);
        });

        it('should solve a problem with an equality constraint', function () {
            var prob = readProb(
                "maximise\n\
                3x - 2y\n\
                subject to\n\
                x + y = 100\n\
                y >= 20\n\
                end\n"
            );

            var mat = toMatrix(prob);
            var finalMat = solve(mat);
            var sol = solution(finalMat);

            expect(sol.x).toBe(80);
            expect(sol.y).toBe(20);
            expect(sol._obj).toBeCloseTo(200);
        });
    });
});
