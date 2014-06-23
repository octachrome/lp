describe('simplex', function () {
    describe('initialSol', function () {
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
            var sol = initialSol(prob, mat);

            expect(sol).toEqual({
                '_s0': -14,
                '_s1': 5
            });
        });
    });
});
