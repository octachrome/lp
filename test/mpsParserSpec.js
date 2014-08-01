describe('mps parser', function () {
    var l, p, clex, mpsParser;

    beforeEach(function () {
        l = require('../js/list');
        clex = require('../js/lex').clex;
        p = require('../js/parser');
        mpsParser = require('../js/mpsParser');
    });

    describe('pRow', function () {
        it('should parse a list of rows', function () {
            var toks = clex(l.fromArray("\
                 N  nn\n\
                 G  g1\n\
                 L  l3\n"));
            var parser = p.pOneOrMore(mpsParser.pRow);
            var result = parser(toks);

            expect(l.toArray(p.takeFirstParse(result))).toEqual([
                {name: 'nn'},
                {name: 'g1', op: '>='},
                {name: 'l3', op: '<='}
            ]);
        });
    });

    describe('pColumn', function () {
        it('should parse a single column', function () {
            var toks = clex(l.fromArray("y1        l4            1.000000"));
            var result = mpsParser.pColumn(toks);
            expect(l.toArray(p.takeFirstParse(result))).toEqual([
                {col: 'y1', row: 'l4', coef: 1}
            ]);
        });

        it('should parse a double column', function () {
            var toks = clex(l.fromArray("y1        g2            1.000000   l3            1.000000"));
            var result = mpsParser.pColumn(toks);
            expect(l.toArray(p.takeFirstParse(result))).toEqual([
                {col: 'y1', row: 'g2', coef: 1},
                {col: 'y1', row: 'l3', coef: 1}
            ]);
        });

        it('should parse a series of columns', function () {
            var toks = clex(l.fromArray(
                "y2        g2           -1.000000   l3           -1.000000\n\
                y2        g5            1.000000\n\
                y3        nn           -1.000000   g1            1.000000\n"));
            var result = mpsParser.pColumns(toks);
            expect(l.toArray(p.takeFirstParse(result))).toEqual([
                {col: 'y2', row: 'g2', coef: -1},
                {col: 'y2', row: 'l3', coef: -1},
                {col: 'y2', row: 'g5', coef: 1},
                {col: 'y3', row: 'nn', coef: -1},
                {col: 'y3', row: 'g1', coef: 1}
            ]);
        });
    });

    describe('pRhs', function () {
        it('should parse a single rhs', function () {
            var toks = clex(l.fromArray("    RHnn0001  g1           10.000000"));
            var result = mpsParser.pRhs(toks);
            expect(l.toArray(p.takeFirstParse(result))).toEqual([
                {row: 'g1', rhs: 10}
            ]);
        });

        it('should parse a double rhs', function () {
            var toks = clex(l.fromArray("    RHnn0001  g1           10.000000   g2            2.000000"));
            var result = mpsParser.pRhs(toks);
            expect(l.toArray(p.takeFirstParse(result))).toEqual([
                {row: 'g1', rhs: 10},
                {row: 'g2', rhs: 2}
            ]);
        });

        it('should parse a series of rhs entries', function () {
            var toks = clex(l.fromArray(
                "RHnn0001  g1           10.000000   g2            2.000000\n\
                RHnn0001  l3            4.000000   l4            6.000000\n\
                RHnn0001  g5            3.000000\n"));

            var result = mpsParser.pRhsSeries(toks);
            expect(l.toArray(p.takeFirstParse(result))).toEqual([
                {row: 'g1', rhs: 10},
                {row: 'g2', rhs: 2},
                {row: 'l3', rhs: 4},
                {row: 'l4', rhs: 6},
                {row: 'g5', rhs: 3}
            ]);
        });
    });

    describe('pProb', function () {
        it('should parse a problem', function () {
            var toks = clex(l.fromArray("\
ROWS\n\
 N  nn\n\
 G  g1      \n\
 L  l4      \n\
 L  g5      \n\
COLUMNS\n\
    y1        nn            2.000000   g1            1.000000\n\
    y1        l4            1.000000\n\
    y4        nn            7.000000   g1            1.000000\n\
    y4        g5            1.000000\n\
RHS\n\
    RHnn0001  g1            4.000000   l4            6.000000\n\
    RHnn0002  g5            4.000000\n"))

            var result = mpsParser.pProb(toks);
            expect(p.takeFirstParse(result)).toEqual({
                objective: {
                    name: 'nn',
                    expr: [{sym: 'y1', coef: 2}, {sym: 'y4', coef: 7}]
                },
                constraints: [
                    {
                        name: 'g1',
                        expr: [{sym: 'y1', coef: 1}, {sym: 'y4', coef: 1}],
                        op: '>=',
                        rhs: 4
                    },
                    {
                        name: 'l4',
                        expr: [{sym: 'y1', coef: 1}],
                        op: '<=',
                        rhs: 6
                    },
                    {
                        name: 'g5',
                        expr: [{sym: 'y4', coef: 1}],
                        op: '<=',
                        rhs: 4
                    }
                ]
            });
        });
    });

    describe('pHeader', function () {
        it('should parse a problem with a single word name', function () {
            var toks = clex(l.fromArray("NAME          T       \n"));
            var result = p.takeFirstParse(mpsParser.pHeader(toks));
            expect(l.toArray(result)).toEqual(['T']);
        });
    });

    describe('pMps', function () {
        it('should parse a real MPS problem', function () {
            var toks = clex(l.fromArray("\
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
ENDATA\n"));

            var result = p.takeFirstParse(mpsParser.pMps(toks));
            expect(result).toEqual({
                objective: {
                    name: 'nn',
                    expr: [{ sym: 'y1', coef: 2 }, { sym: 'y2', coef: 3 }, { sym: 'y3', coef: -1 }, { sym: 'y4', coef: 7 }, { sym: 'y5', coef: 1 } ]
                },
                constraints: [
                    {
                        name: 'g1',
                        op: '>=',
                        expr: [ { sym: 'y1', coef: 1 }, { sym: 'y2', coef: 1 }, { sym: 'y3', coef: 1 }, { sym: 'y4', coef: 1 }, { sym: 'y5', coef: 1 } ],
                        rhs: 10
                    },
                    {
                        name: 'g2',
                        op: '>=',
                        expr: [ { sym: 'y1', coef: 1 }, { sym: 'y2', coef: -1 } ],
                        rhs: 2
                    },
                    {
                        name: 'l3',
                        op: '<=',
                        expr: [ { sym: 'y1', coef: 1 }, { sym: 'y2', coef: -1 } ],
                        rhs: 4
                    },
                    {
                        name: 'l4',
                        op: '<=',
                        expr: [ { sym: 'y1', coef: 1 }, { sym: 'y3', coef: 1 } ],
                        rhs: 6
                    },
                    {
                        name: 'g5',
                        op: '>=',
                        expr: [ { sym: 'y2', coef: 1 }, { sym: 'y4', coef: 1 } ],
                        rhs: 3
                    },
                    {
                        name: 's6',
                        op: '<=',
                        expr: [ { sym: 'y3', coef: 1 }, { sym: 'y5', coef: 1 } ],
                        rhs: 6
                    }
                ]
            });
        })
    });
});
