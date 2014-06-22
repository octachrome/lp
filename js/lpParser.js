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

function createLpParser() {
    exports.pNum = pApply(pSat(isNum), parseFloat);
    exports.pSym = pApply(pSat(isAlpha), mkTerm);
    exports.pCoefSym = pThen(applyCoef, pNum, pSym);
    exports.pTerm = pAlt(pSym, pCoefSym);

    exports.pPlus = pApply(pLit(Tokens.PLUS), ret(1));
    exports.pMinus = pApply(pLit(Tokens.MINUS), ret(-1));
    exports.pOp = pAlt(pPlus, pMinus);

    exports.pSignedTerm = pThen(applyCoef, pOp, pTerm);
    exports.pExpr = pOneOrMore(pSignedTerm);
}
