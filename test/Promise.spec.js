
it("are all tests commented out?");

describe('Promise', function() {
	
    xdescribe('done', function() {
        it("should fire success", function() {
            resolved().done(shouldPass(), shouldFail());
        });
        it("should fire failure", function() {
            rejected().done(shouldFail(), shouldPass());
        });
        xit("should accept many callbacks", function() {
            var p = resolved();
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
        });
        xit("should accept nulls", function() {
            resolved().done(null, null);
            resolved().done(null, shouldFail());
            resolved().done(shouldPass(), null);
        });
        xit("should accept nulls", function() {
            rejected().done(null, null);
            rejected().done(null, shouldPass());
            rejected().done(shouldFail(), null);
        });
    });
    
    xdescribe('then', function() {
        it("should be chainable", function() {
            resolved().then().then().then(shouldPass(), shouldFail());
        });
        it("should be chainable", function() {
            rejected().then().then().then(shouldFail(), shouldPass());
        });
        xit("should pass through", function() {
            var result = resolved("hello").then(null, shouldFail()).getResultNow();
            expect(result).toBe("hello");
            
            result = rejected("goodbye").then(shouldFail(), null).getErrorNow();
            expect(result).toBe("goodbye");

        });
        xit("should map", function() {
            var result = resolved("hello").then(function(result) { return result.toUpperCase(); }).getResultNow();
            expect(result).toBe("HELLO");
        });
        xit("nested promises get flattened", function() {
            var result = resolved("hello").then(function(result) {
                return resolved(result + " ").then(function(result){
	                return resolved(result + "world");
                });
            }).then(function(result) {
	            return resolved(result + "!");
            }).getResultNow();
            expect(result).toBe("hello world!");
        });
        xit("should switch states", function() {
            var result = resolved("success").then(shouldPass(), shouldFail())
                .then(function(result) { return rejected(result + " fail"); })
	            .then(shouldFail(), shouldPass())
                .then(null, function(error) { return resolved(error + " success"); })
	            .then(shouldPass(), shouldFail())
	            .getResultNow();
	        expect(result).toBe("success fail success");
        });
    });
    
    
});
