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
});
