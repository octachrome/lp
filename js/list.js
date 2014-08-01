if (typeof exports === 'undefined') {
    var exports = window.list = {};
}

(function (exports) {
    var _empty = {};

    function empty() {
        return _empty;
    }

    function cons(head, tail) {
        return {
            head: head,
            tail: tail || empty()
        }
    }

    function head(list) {
        if (list === empty()) {
            throw new Error('Attempt to take the head of an empty list');
        }

        return list.head;
    }

    function tail(list) {
        if (list === empty()) {
            throw new Error('Attempt to take the tail of an empty list');
        }
        return list.tail;
    }

    function fromArgs() {
        return fromArray(arguments);
    }

    function fromArray(a) {
        var list = empty();
        for (var i = a.length - 1; i >= 0; i--) {
            list = cons(a[i], list);
        }
        return list;
    }

    function toArray(list) {
        var array = [];
        while (list !== empty()) {
            array[array.length] = head(list);
            list = tail(list);
        }
        return array;
    }

    function toString(list) {
        return toArray(list).join('');
    }

    function length(list) {
        return (list === empty()) ? 0 : 1 + length(list.tail);
    }

    function take(n, list) {
        if (n === 0 || list === empty()) {
            return empty();
        }
        return cons(head(list), take(n - 1, tail(list)));
    }

    function drop(n, list) {
        if (n === 0 || list === empty()) {
            return list;
        }
        return drop(n - 1, tail(list));
    }

    function takeWhile(pred, list) {
        if (list === empty()) {
            return empty();
        }
        var h = head(list);
        if (pred(h)) {
            return cons(h, takeWhile(pred, tail(list)));
        } else {
            return empty();
        }
    }

    function dropWhile(pred, list) {
        if (list === empty()) {
            return empty();
        }
        var h = head(list);
        if (pred(h)) {
            return dropWhile(pred, tail(list));
        } else {
            return list;
        }
    }

    function concat(list1, list2) {
        if (list1 === empty()) {
            return list2;
        }
        return cons(head(list1), concat(tail(list1), list2));
    }

    function each(list, fn) {
        while (list !== empty()) {
            fn(head(list));
            list = tail(list);
        }
    }

    function map(fn, list) {
        if (list == empty()) {
            return empty();
        }
        var h = head(list);
        var t = tail(list);
        return cons(fn(h), map(fn, t));
    }

    function flatMap(fn, list) {
        var results = empty();
        each(list, function (h) {
            results = concat(results, fn(h));
        });
        return results;
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

    exports.empty = empty;
    exports.cons = cons;
    exports.head = head;
    exports.tail = tail;
    exports.fromArgs = fromArgs;
    exports.fromArray = fromArray;
    exports.toArray = toArray;
    exports.toString = toString;
    exports.length = length;
    exports.take = take;
    exports.drop = drop;
    exports.takeWhile = takeWhile;
    exports.dropWhile = dropWhile;
    exports.concat = concat;
    exports.each = each;
    exports.map = map;
    exports.flatMap = flatMap;
    exports.nth = nth;

})(exports);
