var exports = window;

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

function createLpParser() {
    exports.pNum = pApply(pSat(isNum), parseFloat);
    exports.pSym = pApply(pSat(isAlpha), mkTerm);
    exports.pCoefSym = pThen(applyCoef, pNum, pSym);
    exports.pTerm = pAlt(pSym, pCoefSym);

    exports.pPlus = pApply(pLit(Tokens.PLUS), ret(1));
    exports.pMinus = pApply(pLit(Tokens.MINUS), ret(-1));
    exports.pSign = pAlt(pPlus, pMinus);

    exports.pSignedTerm = pThen(applyCoef, pSign, pTerm);
    exports.pInitialTerm = pAlt(pTerm, pSignedTerm);
    exports.pExpr = pThen(cons, pInitialTerm, pZeroOrMore(pSignedTerm));

    exports.pSignedNum = pThen(mul, pSign, pNum);

    exports.pIneq = pAlt(pLit(Tokens.LE), pLit(Tokens.GE));
    exports.pAnonConstraint = pThen3(mkConstraint, pExpr, pIneq, pAlt(pNum, pSignedNum));
    exports.pNamedConstraint = pThen3(nameConstraint, pSat(isAlpha), pLit(Tokens.COLON), pAnonConstraint);
    exports.pConstraint = pAlt(pAnonConstraint, pNamedConstraint);
}
