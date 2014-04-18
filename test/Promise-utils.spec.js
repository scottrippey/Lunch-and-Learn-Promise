describe('Promise static methods', function() {
    describe("all", function() {
        it("should join several results", function() {
            var result = Promise.all([ resolved(1), resolved(2), resolved(3) ]).getResultNow();
            expect(result).toEqual([1,2,3])
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
    describe("any", function() {
        it("should succeed if 1 is successful", function() {
            var result;
            result = Promise.any([ resolved(1), resolved(2), resolved(3) ]).getResultNow();
            expect(result).toEqual(1);
            
            result = Promise.any([ rejected(1), resolved(2), resolved(3) ]).getResultNow();
            expect(result).toEqual(2);
            
            result = Promise.any([ rejected(1), rejected(2), resolved(3) ]).getResultNow();
            expect(result).toEqual(3);
        });
        it("should fail if they all fail", function() {
            var error = Promise.any([ rejected(1), rejected(2), rejected(3) ]).getErrorNow();
            expect(error).toEqual([ 1, 2, 3 ]);
        });
    });
});
