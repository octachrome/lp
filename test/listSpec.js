describe('lists', function () {

    describe('construction', function () {
        it('should construct a list with one element', function () {
            var list = cons('test');

            var h = head(list);
            expect(h).toBe('test');

            var t = tail(list);
            expect(t).toBe(empty());
        })

        it('should construct a list with two elements', function () {
            var list = cons('one', cons('two'));

            var x1 = head(list);
            expect(x1).toBe('one');

            var x2 = head(tail(list));
            expect(x2).toBe('two');

            var t = tail(tail(list));
            expect(t).toBe(empty());
        });
    });

    describe('fromArray', function () {
        it('should create an empty list from an empty array', function () {
            var list = fromArray([]);
            expect(list).toBe(empty());
        });

        it('should create a list from an array', function () {
            var list = fromArray(['a', 'b', 'c']);
            expect(head(list)).toBe('a');
            expect(head(tail(list))).toBe('b');
            expect(head(tail(tail(list)))).toBe('c');
            expect(tail(tail(tail(list)))).toBe(empty());
        });
    });

    describe('toArray', function () {
        it('should convert the empty list to an empty array', function () {
            var array = toArray(empty());
            expect(array).toEqual([]);
        })
    });

    describe('toArray', function () {
        it('should convert a list to an array', function () {
            var list = cons('a', cons('b', cons('c')));
            var array = toArray(list);
            expect(array).toEqual(['a', 'b', 'c']);
        })
    });

    describe('length', function () {
        it('empty list should have length 0', function () {
            var list = empty();
            var len = length(list);
            expect(len).toBe(0);
        });

        it('singleton list should have length 1', function () {
            var list = fromArgs('test');
            var len = length(list);
            expect(len).toBe(1);
        });

        it('long list should have correct length', function () {
            var list = fromArgs('a', 'b', 'c', 'd');
            var len = length(list);
            expect(len).toBe(4);
        });
    });

    describe('take', function () {
        it('should return empty list from empty list', function () {
            var list = take(4, empty());
            expect(list).toBe(empty());
        });

        it('should take no elements', function () {
            var src = fromArgs(0, 1, 2, 3);
            var list = take(0, src)

            expect(list).toBe(empty());
        });

        it('should take three items', function () {
            var src = fromArgs(0, 1, 2, 3);
            var list = take(3, src)

            expect(toArray(list)).toEqual([0, 1, 2]);
        });
    });

    describe('drop', function () {
        it('should return empty list from empty list', function () {
            var list = drop(4, empty());
            expect(list).toBe(empty());
        });

        it('should drop no elements', function () {
            var src = fromArgs(0, 1, 2, 3);
            var list = drop(0, src)

            expect(toArray(list)).toEqual([0, 1, 2, 3]);
        });

        it('should drop two items', function () {
            var src = fromArgs(0, 1, 2, 3);
            var list = drop(2, src)

            expect(toArray(list)).toEqual([2, 3]);
        });
    });

    describe('takeWhile', function () {
        it('should return empty list from empty list', function () {
            var list = takeWhile(null, empty());
            expect(list).toBe(empty());
        });

        it('should return empty list when none match', function () {
            var src = fromArgs(0, 1, 2, 3);
            var pred = partial(eq, 5);
            var list = takeWhile(pred, src)

            expect(list).toBe(empty());
        });

        it('should take matching items and ignore remaining', function () {
            var src = fromArgs(0, 1, 2, 3);
            var pred = partial(ge, 1);
            var list = takeWhile(pred, src)

            expect(toArray(list)).toEqual([0, 1]);
        });
    });

    describe('dropWhile', function () {
        it('should return empty list from empty list', function () {
            var list = dropWhile(null, empty());
            expect(list).toBe(empty());
        });

        it('should return full list when none match', function () {
            var src = fromArgs(0, 1, 2, 3);
            var pred = partial(eq, 5);
            var list = dropWhile(pred, src)

            expect(toArray(list)).toEqual([0, 1, 2, 3]);
        });

        it('should drop matching items and return remaining', function () {
            var src = fromArgs(0, 1, 2, 3);
            var pred = partial(ge, 1);
            var list = dropWhile(pred, src)

            expect(toArray(list)).toEqual([2, 3]);
        });
    });
});
