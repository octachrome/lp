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
