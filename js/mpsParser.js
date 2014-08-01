if (typeof exports === 'undefined') {
    var exports = window.mpsParser = {};
}

(function (exports) {
    var c = require('./core');
    var l = require('./list');
    var p = require('./parser');
    var clex = require('./lex').clex;

    var opMap = {
        'E': '=',
        'G': '>=',
        'L': '<='
    };

    function mkRow(type, sym) {
        var row = {
            name: sym
        };
        if (opMap[type]) {
            row.op = opMap[type];
        }
        return row;
    }

    function mkColumn(col, row, coef) {
        return l.cons({
            col: col,
            row: row,
            coef: coef
        });
    }

    function addColumn(cols, row, coef) {
        var col1 = l.head(cols);
        var col2 = {
            col: col1.col,
            row: row,
            coef: coef
        };
        return l.fromArray([col1, col2]);
    }

    function mkRhs(name, row, rhs) {
        return l.cons({
            row: row,
            rhs: rhs
        });
    }

    function addRhs(prev, row, rhs) {
        return l.concat(prev, l.cons({
            row: row,
            rhs: rhs
        }));
    }

    function mkNegative(sign, num) {
        return -num;
    }

    function mkProb(rows, columns, rhs, bounds) {
        var constraintMap = {};
        l.each(rows, function (row) {
            row.expr = [];
            constraintMap[row.name] = row;
        });

        l.each(columns, function (col) {
            constraintMap[col.row].expr.push({
                sym: col.col,
                coef: col.coef
            });
        });

        l.each(rhs, function (rhs) {
            constraintMap[rhs.row].rhs = rhs.rhs;
        });

        var constraints = [];
        var objective;

        l.each(rows, function (row) {
            if (row.op) {
                constraints.push(constraintMap[row.name]);
            } else {
                objective = row;
            }
        });

        if (bounds) {
            constraints = constraints.concat(l.toArray(bounds));
        }
        return {
            objective: objective,
            constraints: constraints
        };
    }

    function mkBound(type, name, col, val) {
        var c = {
            expr: [{sym: col, coef: 1}],
            rhs: val
        };

        if (type === 'LO' || type === 'LI') {
            c.op = '>=';
        } else if (type === 'UP' || type === 'UI') {
            c.op = '<=';
        } else {
            throw new Error('Unsupported bound type: ' + type);
        }

        return c;
    }

    var pPosNum = p.pApply(p.pSat(c.isNum), parseFloat);
    var pNegNum = p.pThen(mkNegative, p.pLit('-'), pPosNum);
    var pNum = p.pAlt(pPosNum, pNegNum);
    var pSym = p.pSat(c.isAlpha);

    var pRowType = p.pAlt(p.pLit('N'), p.pLit('G'), p.pLit('L'), p.pLit('E'));
    var pRow = p.pThen(mkRow, pRowType, pSym);

    var pSingleColumn = p.pThen3(mkColumn, pSym, pSym, pNum);
    var pDoubleColumn = p.pThen3(addColumn, pSingleColumn, pSym, pNum);

    var pColumn = p.pAlt(pSingleColumn, pDoubleColumn);
    var pColumns = p.pOneOrMoreFlatten(pColumn);

    var pSingleRhs = p.pThen3(mkRhs, pSym, pSym, pNum);
    var pDoubleRhs = p.pThen3(addRhs, pSingleRhs, pSym, pNum);

    var pRhs = p.pAlt(pSingleRhs, pDoubleRhs);
    var pRhsSeries = p.pOneOrMoreFlatten(pRhs);

    /*
    LO    lower bound        b <= x (< +inf)
    UP    upper bound        (0 <=) x <= b
    FX    fixed variable     x = b
    FR    free variable      -inf < x < +inf
    MI    lower bound -inf   -inf < x (<= 0)
    PL    upper bound +inf   (0 <=) x < +inf
    BV    binary variable    x = 0 or 1
    LI    integer variable   b <= x (< +inf)
    UI    integer variable   (0 <=) x <= b
    SC    semi-cont variable x = 0 or l <= x <= b
    */
    var pBoundType = p.pAlt(p.pLit('LO'), p.pLit('UP'), p.pLit('FX'), p.pLit('FR'), p.pLit('MI'), p.pLit('PL'),
        p.pLit('BV'), p.pLit('LI'), p.pLit('UI'), p.pLit('SC'));
    var pBound = p.pThen(mkBound, pBoundType, pSym, pSym, pNum);

    function second(a, b) { return b; }
    var pRowsSection = p.pThen(second, p.pLit('ROWS'), p.pOneOrMore(pRow));
    var pColumnsSection = p.pThen(second, p.pLit('COLUMNS'), pColumns);
    var pRhsSection = p.pThen(second, p.pLit('RHS'), pRhsSeries);
    var pBoundsSection = p.pThen(second, p.pLit('BOUNDS'), p.pOneOrMore(pBound));
    var pProb = p.pThen(mkProb, pRowsSection, pColumnsSection, pRhsSection, p.pMaybe(pBoundsSection));

    var pAny = p.pSat(function () { return true; });
    var pHeader = p.pThen(second, p.pLit('NAME'), p.pOneOrMore(pAny));
    var pMps = p.pThen3(second, pHeader, pProb, p.pLit('ENDATA'));

    exports.pRow = pRow;
    exports.pColumn = pColumn;
    exports.pColumns = pColumns;
    exports.pRhs = pRhs;
    exports.pRhsSeries = pRhsSeries;
    exports.pProb = pProb;
    exports.pHeader = pHeader;
    exports.pMps = pMps;

    exports.readMps = function readMps(str) {
        var toks = clex(l.fromArray(str));
        var result = pMps(toks);
        return p.takeFirstParse(result);
    }
})(exports);
