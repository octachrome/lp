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

function mkProb(rows, columns, rhs) {
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

    return {
        objective: objective,
        constraints: constraints
    };
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

    function second(a, b) { return b; }
    var pRowsSection = pThen(second, pLit('ROWS'), pOneOrMore(pRow));
    var pColumnsSection = pThen(second, pLit('COLUMNS'), pColumns);
    var pRhsSection = pThen(second, pLit('RHS'), pRhsSeries);
    var pProb = pThen3(mkProb, pRowsSection, pColumnsSection, pRhsSection);

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
