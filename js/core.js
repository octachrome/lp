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

function nth(n, list) {
    if (list === empty()) {
        throw new Error('Index out of bounds in nth');
    }
    if (n == 0) {
        return head(list);
    } else {
        return nth(n - 1, tail(list));
    }
}
