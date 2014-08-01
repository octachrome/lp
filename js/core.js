if (typeof exports === 'undefined') {
    var exports = window.core = {};
}

(function (exports) {
    function eq(a, b) {
        return a === b;
    }

    function ne(a, b) {
        return a !== b;
    }

    function gt(a, b) {
        return a > b;
    }

    function lt(a, b) {
        return a < b;
    }

    function ge(a, b) {
        return a >= b;
    }

    function le(a, b) {
        return a <= b;
    }

    function add(a, b) {
        return a + b;
    }

    function sub(a, b) {
        return a + b;
    }

    function mul(a, b) {
        return a * b;
    }

    function div(a, b) {
        return a / b;
    }

    function inv(f) {
        return function (x) {
            return !f(x);
        }
    }

    function isWhitespace(c) {
        return c[0] === ' ' || c[0] === '\t' || c[0] === '\n';
    }

    function isNum(c) {
        return c[0] >= '0' && c[0] <= '9';
    }

    function isNumOrDot(c) {
        return c[0] >= '0' && c[0] <= '9' || c[0] === '.';
    }

    function isAlpha(c) {
        return c[0] >= 'a' && c[0] <= 'z' || c[0] >= 'A' && c[0] <= 'Z';
    }

    function isIdChar(c) {
        return isAlpha(c) || isNum(c) || c === '_';
    }

    function partial(fn, others) {
        var bound = Array.prototype.slice.call(arguments, 1);
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, bound.concat(args));
        }
    }

    exports.eq = eq;
    exports.ne = ne;
    exports.gt = gt;
    exports.lt = lt;
    exports.ge = ge;
    exports.le = le;
    exports.add = add;
    exports.sub = sub;
    exports.mul = mul;
    exports.div = div;
    exports.inv = inv;
    exports.isWhitespace = isWhitespace;
    exports.isNum = isNum;
    exports.isNumOrDot = isNumOrDot;
    exports.isAlpha = isAlpha;
    exports.isIdChar = isIdChar;
    exports.partial = partial;

})(exports);
