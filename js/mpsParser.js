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
    return cons({
        col: col,
        row: row,
        coef: coef
    });
}

function addColumn(cols, row, coef) {
    var col1 = head(cols);
    var col2 = {
        col: col1.col,
        row: row,
        coef: coef
    };
    return fromArray([col1, col2]);
}

function mkRhs(name, row, rhs) {
    return cons({
        row: row,
        rhs: rhs
    });
}

function addRhs(prev, row, rhs) {
    return concat(prev, cons({
        row: row,
        rhs: rhs
    }));
}

function mkNegative(sign, num) {
    return -num;
}

function mkProb(rows, columns, rhs, bounds) {
    var constraintMap = {};
    each(rows, function (row) {
        row.expr = [];
        constraintMap[row.name] = row;
    });

    each(columns, function (col) {
        constraintMap[col.row].expr.push({
            sym: col.col,
            coef: col.coef
        });
    });

    each(rhs, function (rhs) {
        constraintMap[rhs.row].rhs = rhs.rhs;
    });

    var constraints = [];
    var objective;

    each(rows, function (row) {
        if (row.op) {
            constraints.push(constraintMap[row.name]);
        } else {
            objective = row;
        }
    });

    if (bounds) {
        constraints = constraints.concat(toArray(bounds));
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

function createMpsParser() {
    var pPosNum = pApply(pSat(isNum), parseFloat);
    var pNegNum = pThen(mkNegative, pLit('-'), pPosNum);
    var pNum = pAlt(pPosNum, pNegNum);
    var pSym = pSat(isAlpha);

    var pRowType = pAlt(pLit('N'), pLit('G'), pLit('L'), pLit('E'));
    var pRow = pThen(mkRow, pRowType, pSym);

    var pSingleColumn = pThen3(mkColumn, pSym, pSym, pNum);
    var pDoubleColumn = pThen3(addColumn, pSingleColumn, pSym, pNum);

    var pColumn = pAlt(pSingleColumn, pDoubleColumn);
    var pColumns = pOneOrMoreFlatten(pColumn);

    var pSingleRhs = pThen3(mkRhs, pSym, pSym, pNum);
    var pDoubleRhs = pThen3(addRhs, pSingleRhs, pSym, pNum);

    var pRhs = pAlt(pSingleRhs, pDoubleRhs);
    var pRhsSeries = pOneOrMoreFlatten(pRhs);

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
    var pBoundType = pAlt(pLit('LO'), pLit('UP'), pLit('FX'), pLit('FR'), pLit('MI'), pLit('PL'), pLit('BV'),
        pLit('LI'), pLit('UI'), pLit('SC'));
    var pBound = pThen(mkBound, pBoundType, pSym, pSym, pNum);

    function second(a, b) { return b; }
    var pRowsSection = pThen(second, pLit('ROWS'), pOneOrMore(pRow));
    var pColumnsSection = pThen(second, pLit('COLUMNS'), pColumns);
    var pRhsSection = pThen(second, pLit('RHS'), pRhsSeries);
    var pBoundsSection = pThen(second, pLit('BOUNDS'), pOneOrMore(pBound));
    var pProb = pThen(mkProb, pRowsSection, pColumnsSection, pRhsSection, pMaybe(pBoundsSection));

    var pAny = pSat(function () { return true; });
    var pHeader = pThen(second, pLit('NAME'), pOneOrMore(pAny));
    var pMps = pThen3(second, pHeader, pProb, pLit('ENDATA'));

    window.mpsParser = {
        pRow: pRow,
        pColumn: pColumn,
        pColumns: pColumns,
        pRhs: pRhs,
        pRhsSeries: pRhsSeries,
        pProb: pProb,
        pHeader: pHeader,
        pMps: pMps
    };
}

function readMps(str) {
    var toks = clex(fromArray(str));
    var result = mpsParser.pMps(toks);
    return takeFirstParse(result);
}
