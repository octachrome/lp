describe('lists', function () {
    var c, l;

    beforeEach(function () {
        c = require('../js/core');
        l = require('../js/list');
    });

    describe('construction', function () {
        it('should construct a list with one element', function () {
            var list = l.cons('test');

            var h = l.head(list);
            expect(h).toBe('test');

            var t = l.tail(list);
            expect(t).toBe(l.empty());
        })

        it('should construct a list with two elements', function () {
            var list = l.cons('one', l.cons('two'));

            var x1 = l.head(list);
            expect(x1).toBe('one');

            var x2 = l.head(l.tail(list));
            expect(x2).toBe('two');

            var t = l.tail(l.tail(list));
            expect(t).toBe(l.empty());
        });
    });

    describe('fromArray', function () {
        it('should create an empty list from an empty array', function () {
            var list = l.fromArray([]);
            expect(list).toBe(l.empty());
        });

        it('should create a list from an array', function () {
            var list = l.fromArray(['a', 'b', 'c']);
            expect(l.head(list)).toBe('a');
            expect(l.head(l.tail(list))).toBe('b');
            expect(l.head(l.tail(l.tail(list)))).toBe('c');
            expect(l.tail(l.tail(l.tail(list)))).toBe(l.empty());
        });
    });

    describe('toArray', function () {
        it('should convert the empty list to an empty array', function () {
            var array = l.toArray(l.empty());
            expect(array).toEqual([]);
        })
    });

    describe('toArray', function () {
        it('should convert a list to an array', function () {
            var list = l.cons('a', l.cons('b', l.cons('c')));
            var array = l.toArray(list);
            expect(array).toEqual(['a', 'b', 'c']);
        })
    });

    describe('length', function () {
        it('empty list should have length 0', function () {
            var list = l.empty();
            var len = l.length(list);
            expect(len).toBe(0);
        });

        it('singleton list should have length 1', function () {
            var list = l.fromArgs('test');
            var len = l.length(list);
            expect(len).toBe(1);
        });

        it('long list should have correct length', function () {
            var list = l.fromArgs('a', 'b', 'c', 'd');
            var len = l.length(list);
            expect(len).toBe(4);
        });
    });

    describe('take', function () {
        it('should return empty list from empty list', function () {
            var list = l.take(4, l.empty());
            expect(list).toBe(l.empty());
        });

        it('should take no elements', function () {
            var src = l.fromArgs(0, 1, 2, 3);
            var list = l.take(0, src)

            expect(list).toBe(l.empty());
        });

        it('should take three items', function () {
            var src = l.fromArgs(0, 1, 2, 3);
            var list = l.take(3, src)

            expect(l.toArray(list)).toEqual([0, 1, 2]);
        });
    });

    describe('drop', function () {
        it('should return empty list from empty list', function () {
            var list = l.drop(4, l.empty());
            expect(list).toBe(l.empty());
        });

        it('should drop no elements', function () {
            var src = l.fromArgs(0, 1, 2, 3);
            var list = l.drop(0, src)

            expect(l.toArray(list)).toEqual([0, 1, 2, 3]);
        });

        it('should drop two items', function () {
            var src = l.fromArgs(0, 1, 2, 3);
            var list = l.drop(2, src)

            expect(l.toArray(list)).toEqual([2, 3]);
        });
    });

    describe('takeWhile', function () {
        it('should return empty list from empty list', function () {
            var list = l.takeWhile(null, l.empty());
            expect(list).toBe(l.empty());
        });

        it('should return empty list when none match', function () {
            var src = l.fromArgs(0, 1, 2, 3);
            var pred = c.partial(c.eq, 5);
            var list = l.takeWhile(pred, src)

            expect(list).toBe(l.empty());
        });

        it('should take matching items and ignore remaining', function () {
            var src = l.fromArgs(0, 1, 2, 3);
            var pred = c.partial(c.ge, 1);
            var list = l.takeWhile(pred, src)

            expect(l.toArray(list)).toEqual([0, 1]);
        });
    });

    describe('dropWhile', function () {
        it('should return empty list from empty list', function () {
            var list = l.dropWhile(null, l.empty());
            expect(list).toBe(l.empty());
        });

        it('should return full list when none match', function () {
            var src = l.fromArgs(0, 1, 2, 3);
            var pred = c.partial(c.eq, 5);
            var list = l.dropWhile(pred, src)

            expect(l.toArray(list)).toEqual([0, 1, 2, 3]);
        });

        it('should drop matching items and return remaining', function () {
            var src = l.fromArgs(0, 1, 2, 3);
            var pred = c.partial(c.ge, 1);
            var list = l.dropWhile(pred, src)

            expect(l.toArray(list)).toEqual([2, 3]);
        });
    });

    describe('concat', function () {
        it('should concatenate two empty lists', function () {
            var list = l.concat(l.empty(), l.empty());
            expect(list).toBe(l.empty());
        });

        it('should concatenate a simple list with an empty list', function () {
            var list = l.concat(l.fromArgs(1), l.empty());
            expect(l.toArray(list)).toEqual([1]);
        });

        it('should concatenate an empty list with a simple list', function () {
            var list = l.concat(l.empty(), l.fromArgs(1));
            expect(l.toArray(list)).toEqual([1]);
        });
    });

    describe('map', function () {
        it('should map over an empty list', function () {
            var list = l.map(null, l.empty());
            expect(list).toBe(l.empty());
        });

        it('should map over several items', function () {
            var src = l.fromArray([1, 2, 3, 4]);
            var fn = c.partial(c.eq, 2);
            var list = l.map(fn, src);
            expect(l.toArray(list)).toEqual([false, true, false, false]);
        });
    });
});
