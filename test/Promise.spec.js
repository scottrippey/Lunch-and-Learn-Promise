
describe('Promise', function() {
    
    describe('then', function() {
        it("should fire success", function() {
            resolved().then(shouldPass(), shouldFail());
        });
        it("should fire failure", function() {
            rejected().then(shouldFail(), shouldPass());
        });
        it("should accept many callbacks", function() {
            var p = resolved();
            p.then(shouldPass(), shouldFail());
            p.then(shouldPass(), shouldFail());
            p.then(shouldPass(), shouldFail());
            p.then(shouldPass(), shouldFail());
        });
        it("should accept nulls", function() {
            resolved().then(null, null);
            resolved().then(null, shouldFail());
            resolved().then(shouldPass(), null);
        });
        it("should accept nulls", function() {
            rejected().then(null, null);
            rejected().then(null, shouldPass());
            rejected().then(shouldFail(), null);
        });
    });
    
    describe('pipe', function() {
        it("should be chainable", function() {
            resolved().pipe().pipe().pipe(shouldPass(), shouldFail());
        });
        it("should be chainable", function() {
            rejected().pipe().pipe().pipe(shouldFail(), shouldPass());
        });
        it("should pass through", function() {
            var result = resolved("hello").pipe(null, shouldFail()).getResultNow();
            expect(result).toBe("hello");
            
            result = rejected("goodbye").pipe(shouldFail(), null).getErrorNow();
            expect(result).toBe("goodbye");

        });
        it("should map", function() {
            var result = resolved("hello").pipe(function(result) { return result.toUpperCase(); }).getResultNow();
            expect(result).toBe("HELLO");
        });
        it("nested promises get flattened", function() {
            var result = resolved("hello").pipe(function(result) {
                return resolved(result + " ").pipe(function(result){
	                return resolved(result + "world");
                });
            }).pipe(function(result) {
	            return resolved(result + "!");
            }).getResultNow();
            expect(result).toBe("hello world!");
        });
        it("should switch states", function() {
            var result = resolved("success").pipe(shouldPass(), shouldFail())
                .pipe(function(result) { return rejected(result + " fail"); })
	            .pipe(shouldFail(), shouldPass())
                .pipe(null, function(error) { return resolved(error + " success"); })
	            .pipe(shouldPass(), shouldFail())
	            .getResultNow();
	        expect(result).toBe("success fail success");
        });
    });
    
    
});
