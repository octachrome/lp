describe('simplex', function () {
    var simplex, lpParser, mpsParser, preproc;

    beforeEach(function () {
        lpParser = require('../js/lpParser');
        mpsParser = require('../js/mpsParser');
        simplex = require('../js/simplex');
        preproc = require('../js/preproc');
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

            var sol = simplex.solution(mat);

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

            var sol = simplex.solution(mat);

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

            var sol = simplex.solution(mat);

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

            var pv = simplex.pivotVar(mat);
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

            var pv = simplex.pivotVar(mat);
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
            var pr = simplex.pivotRow(mat, pv);
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
            var pr = simplex.pivotRow(mat, pv);
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

            var pivoted = simplex.pivot(mat, 0, 4);

            expect(simplex.augmentedRow(pivoted, 0)).toEqual([0,  -3,   1,   1,   3,   0,   0,   3]);
            expect(simplex.augmentedRow(pivoted, 1)).toBeMultipleOf([12,  6,  -1,  -1,   0,   0,   0,  27]);
            expect(simplex.augmentedRow(pivoted, 2)).toEqual([0,   1,   0, -10,   0,   2,   0,  10]);
            expect(simplex.augmentedRow(pivoted, 3)).toBeMultipleOf([0,  -3,   4,   4,   0,   0,  15,  57]);

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

            var inf = simplex.firstInfeasibility(mat);
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

            var inf = simplex.firstInfeasibility(mat);
            expect(inf).toEqual({
                row: 1,
                col: 2,
                sym: 'c'
            });
        });
    });

    describe('full solve', function () {
        it('should solve a simple problem', function () {
            var prob = lpParser.readLp(
                "maximise\n\
                7x + 5y\n\
                subject to\n\
                2x + y <= 100\n\
                4x + 3y <= 240\n\
                end\n"
            );
            var mat = preproc.toMatrix(prob);
            var finalMat = simplex.solve(mat);
            var sol = simplex.solution(finalMat);

            expect(sol.x).toBe(30);
            expect(sol.y).toBe(40);
            expect(sol._obj).toBeCloseTo(410);
        });

        it('should solve a problem which is initially infeasible', function () {
            var prob = lpParser.readLp(
                "maximise\n\
                2x + 3y + z\n\
                subject to\n\
                x + y + z <= 40\n\
                2x + y - z >= 10\n\
                -y + z >= 10\n\
                end\n"
            );
            var mat = preproc.toMatrix(prob);
            var finalMat = simplex.solve(mat);
            var sol = simplex.solution(finalMat);

            expect(sol.x).toBe(10);
            expect(sol.y).toBe(10);
            expect(sol.z).toBe(20);
            expect(sol._obj).toBe(70);
        });

        it('should solve a problem with an equality constraint', function () {
            var prob = lpParser.readLp(
                "maximise\n\
                3x - 2y\n\
                subject to\n\
                x + y = 100\n\
                y >= 20\n\
                end\n"
            );

            var mat = preproc.toMatrix(prob);
            var finalMat = simplex.solve(mat);
            var sol = simplex.solution(finalMat);

            expect(sol.x).toBe(80);
            expect(sol.y).toBe(20);
            expect(sol._obj).toBeCloseTo(200);
        });

        it('should detect an unbouned problem', function () {
            var prob = lpParser.readLp(
                "maximise\n\
                3x - 2y\n\
                subject to\n\
                y <= 100\n\
                end\n"
            );

            var mat = preproc.toMatrix(prob);
            var finalMat = simplex.solve(mat);

            expect(finalMat.status).toBe('unbounded');
        });

        it('should detect an infeasible problem', function () {
            var prob = lpParser.readLp(
                "maximise x\n\
                subject to\n\
                x <= 10\n\
                x >= 20\n\
                end\n"
            );

            var mat = preproc.toMatrix(prob);
            var finalMat = simplex.solve(mat);

            expect(finalMat.status).toBe('infeasible');
        });

        it('should solve a small MPS problem', function () {
            var prob = mpsParser.readMps("\
NAME          T       \n\
ROWS\n\
 N  nn\n\
 G  g1      \n\
 G  g2      \n\
 L  l3      \n\
 L  l4      \n\
 G  g5      \n\
 L  s6      \n\
COLUMNS\n\
    y1        nn            2.000000   g1            1.000000\n\
    y1        g2            1.000000   l3            1.000000\n\
    y1        l4            1.000000\n\
    y2        nn            3.000000   g1            1.000000\n\
    y2        g2           -1.000000   l3           -1.000000\n\
    y2        g5            1.000000\n\
    y3        nn           -1.000000   g1            1.000000\n\
    y3        l4            1.000000   s6            1.000000\n\
    y4        nn            7.000000   g1            1.000000\n\
    y4        g5            1.000000\n\
    y5        nn            1.000000   g1            1.000000\n\
    y5        s6            1.000000\n\
RHS\n\
    RHnn0001  g1           10.000000   g2            2.000000\n\
    RHnn0001  l3            4.000000   l4            6.000000\n\
    RHnn0001  g5            3.000000   s6            6.000000\n\
ENDATA\n");
            prob.objective.dir = 'minimise';

            var mat = preproc.toMatrix(prob);
            var finalMat = simplex.solve(mat);
            var sol = simplex.solution(finalMat);

            expect(sol.y1).toBe(5);
            expect(sol.y2).toBe(3);
            expect(sol.y3).toBe(1);
            expect(sol.y4).toBe(0);
            expect(sol.y5).toBe(1);
            expect(sol._obj).toBe(-19);
        });

        it('should solve a MPS problem with bounds', function () {
            var prob = mpsParser.readMps("\
NAME          TRIMLOSS\n\
ROWS\n\
 N  Trimloss\n\
 G  Demand01\n\
 G  Demand02\n\
 G  Demand03\n\
COLUMNS\n\
    x_____01  Trimloss     10.000000   Demand01      5.000000\n\
    x_____02  Trimloss      2.000000   Demand01      4.000000\n\
    x_____02  Demand02      1.000000\n\
    x_____03  Demand01      4.000000   Demand03      1.000000\n\
    x_____04  Trimloss      6.000000   Demand01      2.000000\n\
    x_____04  Demand02      2.000000\n\
    x_____05  Trimloss      4.000000   Demand01      2.000000\n\
    x_____05  Demand02      1.000000   Demand03      1.000000\n\
    x_____06  Trimloss      2.000000   Demand01      2.000000\n\
    x_____06  Demand03      2.000000\n\
    x_____07  Trimloss     10.000000   Demand02      3.000000\n\
    x_____08  Trimloss      8.000000   Demand02      2.000000\n\
    x_____08  Demand03      1.000000\n\
    x_____09  Trimloss      6.000000   Demand02      1.000000\n\
    x_____09  Demand03      2.000000\n\
    x_____10  Trimloss      4.000000   Demand03      3.000000\n\
RHS\n\
    RHS00001  Demand01      8.000000   Demand02     13.000000\n\
    RHS00001  Demand03     10.000000\n\
BOUNDS\n\
 UI BOUND001  x_____01      9.000000\n\
 UI BOUND001  x_____02      9.000000\n\
 UI BOUND001  x_____03      9.000000\n\
 UI BOUND001  x_____04      9.000000\n\
 UI BOUND001  x_____05      9.000000\n\
 UI BOUND001  x_____06      9.000000\n\
 UI BOUND001  x_____07      9.000000\n\
 UI BOUND001  x_____08      9.000000\n\
 UI BOUND001  x_____09      9.000000\n\
 UI BOUND001  x_____10      9.000000\n\
ENDATA\n");
            prob.objective.dir = 'minimise';

            var mat = preproc.toMatrix(prob);
            var finalMat = simplex.solve(mat);
            var sol = simplex.solution(finalMat);

            expect(sol.x_____01).toBe(0);
            expect(sol.x_____02).toBe(9);
            expect(sol.x_____03).toBe(9);
            expect(sol.x_____04).toBe(1.5);
            expect(sol.x_____05).toBe(1);
            expect(sol.x_____06).toBe(0);
            expect(sol.x_____07).toBe(0);
            expect(sol.x_____08).toBe(0);
            expect(sol.x_____09).toBe(0);
            expect(sol.x_____10).toBe(0);
            expect(sol._obj).toBeCloseTo(-31);
        });
    });
});
