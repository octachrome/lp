describe('preproc', function () {
    describe('canonical', function () {
        it('should convert a <= constraint into an equality', function () {
            var prob = {
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}],
                        op: '<=',
                        rhs: 14
                    }
                ]
            };

            var can = canonical(prob);

            expect(can).toEqual({
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}, {sym: '_s0', coef: 1}],
                        op: '=',
                        rhs: 14,
                        slackVar: '_s0'
                    }
                ]
            });
        });

        it('should convert a >= constraint into an equality', function () {
            var prob = {
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}],
                        op: '>=',
                        rhs: 14
                    }
                ]
            };

            var can = canonical(prob);

            expect(can).toEqual({
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}, {sym: '_s0', coef: -1}],
                        op: '=',
                        rhs: 14,
                        slackVar: '_s0'
                    }
                ]
            });
        });

        it('should leave an equality constraint alone', function () {
            var prob = {
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}],
                        op: '=',
                        rhs: 14
                    }
                ]
            };

            var can = canonical(prob);

            expect(can).toEqual({
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}],
                        op: '=',
                        rhs: 14
                    }
                ]
            });
        });

        it('should assign unique slack variables', function () {
            var prob = {
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}],
                        op: '>=',
                        rhs: 1
                    },
                    {
                        expr: [{sym: 'a', coef: 2}, {sym: 'b', coef: 3}],
                        op: '<=',
                        rhs: 4
                    }
                ]
            };

            var can = canonical(prob);

            expect(can).toEqual({
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}, {sym: '_s0', coef: -1}],
                        op: '=',
                        rhs: 1,
                        slackVar: '_s0'
                    },
                    {
                        expr: [{sym: 'a', coef: 2}, {sym: 'b', coef: 3}, {sym: '_s1', coef: 1}],
                        op: '=',
                        rhs: 4,
                        slackVar: '_s1'
                    }
                ]
            });
        });

        it('should convert a constraint with a negative rhs into one with a positive rhs', function () {
            var prob = {
                constraints: [
                    {
                        expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: 1}],
                        op: '<=',
                        rhs: -14
                    }
                ]
            };

            var can = canonical(prob);

            expect(can).toEqual({
                constraints: [
                    {
                        expr: [{sym: 'x', coef: -1}, {sym: 'y', coef: -1}, {sym: '_s0', coef: -1}],
                        op: '=',
                        rhs: 14,
                        slackVar: '_s0'
                    }
                ]
            });
        });

        it('should convert a minimisation problem to a minimisation problem', function () {
            var prob = {
                objective: {
                    dir: 'minimise',
                    expr: [{sym: 'x', coef: 1}, {sym: 'y', coef: -1}]
                }
            };

            var can = canonical(prob);

            expect(can).toEqual({
                objective: {
                    dir: 'maximise',
                    expr: [{sym: 'x', coef: -1}, {sym: 'y', coef: 1}]
                }
            });
        });
    });
});
