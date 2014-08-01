if (typeof exports === 'undefined') {
    var exports = window.lpParser = {};
}

(function (exports) {
    var c = require('./core');
    var l = require('./list');
    var lex = require('./lex');
    var p = require('./parser');

    var Tokens = lex.Tokens;
    var clex = lex.clex;

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
            expr: l.toArray(expr),
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
            expr: l.toArray(expr)
        };
    }

    function mkConstraints(st, constraints) {
        return l.toArray(constraints);
    }

    function mkLp(objective, constraints) {
        return {
            objective: objective,
            constraints: constraints
        };
    }

    var pNum = p.pApply(p.pSat(c.isNum), parseFloat);
    var pSym = p.pApply(p.pSat(c.isAlpha), mkTerm);
    var pCoefSym = p.pThen(applyCoef, pNum, pSym);
    var pTerm = p.pAlt(pSym, pCoefSym);

    var pPlus = p.pApply(p.pLit(Tokens.PLUS), ret(1));
    var pMinus = p.pApply(p.pLit(Tokens.MINUS), ret(-1));
    var pSign = p.pAlt(pPlus, pMinus);

    var pSignedTerm = p.pThen(applyCoef, pSign, pTerm);
    var pInitialTerm = p.pAlt(pTerm, pSignedTerm);
    var pExpr = p.pThen(l.cons, pInitialTerm, p.pZeroOrMore(pSignedTerm));

    var pSignedNum = p.pThen(c.mul, pSign, pNum);

    var pIneq = p.pAlt(p.pLit(Tokens.LE), p.pLit(Tokens.GE), p.pLit(Tokens.EQ));
    var pAnonConstraint = p.pThen3(mkConstraint, pExpr, pIneq, p.pAlt(pNum, pSignedNum));
    var pNamedConstraint = p.pThen3(nameConstraint, p.pSat(c.isAlpha), p.pLit(Tokens.COLON), pAnonConstraint);
    var pConstraint = p.pAlt(pAnonConstraint, pNamedConstraint);

    var pDirection = p.pAlt(p.pLit(Tokens.MIN), p.pLit(Tokens.MAX));
    var pObjective = p.pThen(mkObjective, pDirection, pExpr);

    var pConstraints = p.pThen(mkConstraints, p.pLit(Tokens.SUBJECT_TO), p.pOneOrMore(pConstraint));

    var pLp = p.pThen3(mkLp, pObjective, pConstraints, p.pLit(Tokens.END));

    exports.pNum = pNum;
    exports.pSignedTerm = pSignedTerm;
    exports.pExpr = pExpr;
    exports.pConstraint = pConstraint;
    exports.pConstraints = pConstraints;
    exports.pObjective = pObjective;
    exports.pLp = pLp;

    exports.readLp = function readLp(str) {
        var toks = clex(l.fromArray(str));
        var result = pLp(toks);
        return p.takeFirstParse(result);
    }

})(exports);
