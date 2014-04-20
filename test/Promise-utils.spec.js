describe('Promise static methods', function() {
    describe("all", function() {
        it("should join an array of results", function() {
            var result = Promise.all([ resolved(1), resolved(2), resolved(3) ]).getResultNow();
            expect(result).toEqual([1,2,3])
        });
        it("should join a hash of results", function() {
            var result = Promise.all({ one: resolved(1), two: resolved(2), three: resolved(3) }).getResultNow();
            expect(result).toEqual({ one: 1, two: 2, three: 3 });
        });
        it("should work with no items", function() {
            var result = Promise.all([]).getResultNow();
            expect(result).toEqual([]);
        });
        it("should fail if 1 of them fail", function() {
            var error = Promise.all([ resolved(1), rejected(2), resolved(3) ]).getErrorNow();
            expect(error).toEqual(2);
        });
        it("should fail if 2 of them fail", function() {
            var error = Promise.all([ resolved(1), rejected(2), resolved(3), rejected(4) ]).getErrorNow();
            expect(error).toEqual(2);
        });
    });
});
