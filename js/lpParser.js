function ret(r) {
    return function() {
        return r;
    }
}

function mkTerm(sym) {
    return {
        sym: sym,
        coef: 1
    };
}

function applyCoef(coef, term) {
    return {
        sym: term.sym,
        coef: term.coef * coef
    };
}

function mkConstraint(expr, op, rhs) {
    return {
        expr: toArray(expr),
        op: op,
        rhs: rhs
    };
}

function nameConstraint(name, colon, c) {
    return {
        name: name,
        expr: c.expr,
        op: c.op,
        rhs: c.rhs
    };
}

function mkObjective(dir, expr) {
    return {
        dir: dir,
        expr: toArray(expr)
    };
}

function mkConstraints(st, constraints) {
    return toArray(constraints);
}

function mkLp(objective, constraints) {
    return {
        objective: objective,
        constraints: constraints
    };
}

function createLpParser() {
    var pNum = pApply(pSat(isNum), parseFloat);
    var pSym = pApply(pSat(isAlpha), mkTerm);
    var pCoefSym = pThen(applyCoef, pNum, pSym);
    var pTerm = pAlt(pSym, pCoefSym);

    var pPlus = pApply(pLit(Tokens.PLUS), ret(1));
    var pMinus = pApply(pLit(Tokens.MINUS), ret(-1));
    var pSign = pAlt(pPlus, pMinus);

    var pSignedTerm = pThen(applyCoef, pSign, pTerm);
    var pInitialTerm = pAlt(pTerm, pSignedTerm);
    var pExpr = pThen(cons, pInitialTerm, pZeroOrMore(pSignedTerm));

    var pSignedNum = pThen(mul, pSign, pNum);

    var pIneq = pAlt(pLit(Tokens.LE), pLit(Tokens.GE), pLit(Tokens.EQ));
    var pAnonConstraint = pThen3(mkConstraint, pExpr, pIneq, pAlt(pNum, pSignedNum));
    var pNamedConstraint = pThen3(nameConstraint, pSat(isAlpha), pLit(Tokens.COLON), pAnonConstraint);
    var pConstraint = pAlt(pAnonConstraint, pNamedConstraint);

    var pDirection = pAlt(pLit(Tokens.MIN), pLit(Tokens.MAX));
    var pObjective = pThen(mkObjective, pDirection, pExpr);

    var pConstraints = pThen(mkConstraints, pLit(Tokens.SUBJECT_TO), pOneOrMore(pConstraint));

    var pLp = pThen3(mkLp, pObjective, pConstraints, pLit(Tokens.END));

    window.lpParser = {
        pNum: pNum,
        pSignedTerm: pSignedTerm,
        pExpr: pExpr,
        pConstraint: pConstraint,
        pConstraints: pConstraints,
        pObjective: pObjective,
        pLp: pLp
    };
}

function readLp(str) {
    var toks = clex(fromArray(str));
    var result = lpParser.pLp(toks);
    return takeFirstParse(result);
}
