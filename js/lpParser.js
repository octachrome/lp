var exports = window;

function ret(r) {
    return function() {
        return r;
    }
}

function mkTerm(coeff, sym) {
    return {
        sym: sym,
        coeff: coeff
    };
}

function applySign(sign, term) {
    return {
        sym: term.sym,
        coeff: term.coeff * sign
    };
}

function createLpParser() {
    exports.pNum = pApply(pSat(isNum), parseFloat);
    exports.pSym = pSat(isAlpha);
    exports.pTerm = pThen(mkTerm, pNum, pSym);

    exports.pPlus = pApply(pLit(Tokens.PLUS), ret(1));
    exports.pMinus = pApply(pLit(Tokens.MINUS), ret(-1));
    exports.pOp = pAlt(pPlus, pMinus);

    exports.pSignedTerm = pThen(applySign, pOp, pTerm);
    exports.pExpr = pOneOrMore(pSignedTerm);
}
