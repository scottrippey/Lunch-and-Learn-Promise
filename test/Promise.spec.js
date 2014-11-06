
describe('Promise', function() {
    
    describe('done', function() {
        it("should fire success", function() {
            resolved().done(shouldPass(), shouldFail());
        });
        it("should fire failure", function() {
            rejected().done(shouldFail(), shouldPass());
        });
	    it("should fire async, no matter what", function() {
		    var resolve, state = "unresolved";
		    new Promise(function(res, rej) {
			    resolve = res;
		    }).done(function() {
				state = "resolved";
		    });
		    
		    expect(state).toBe("unresolved");
		    resolve();
		    expect(state).toBe("unresolved");
		    simulateAsync();
		    expect(state).toBe("resolved");
		    
		    var reject; state = "unresolved";
		    new Promise(function(res,rej) {
			    reject = rej;
		    }).done(null, function() {
				state = "rejected";
		    });
		    
		    expect(state).toBe("unresolved");
		    reject();
		    expect(state).toBe("unresolved");
		    simulateAsync();
		    expect(state).toBe("rejected");
	    });
        it("should accept many callbacks", function() {
            var p = resolved();
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
            p.done(shouldPass(), shouldFail());
        });
        it("should accept nulls", function() {
            resolved().done(null, null);
            resolved().done(null, shouldFail());
            resolved().done(shouldPass(), null);
        });
        it("should accept nulls", function() {
            rejected().done(null, null);
            rejected().done(null, shouldPass());
            rejected().done(shouldFail(), null);
        });
    });
    
    describe('then', function() {
        it("should be chainable", function() {
            resolved().then().then().then(shouldPass(), shouldFail());
        });
        it("should be chainable", function() {
            rejected().then().then().then(shouldFail(), shouldPass());
        });
        it("should pass through", function() {
            var result = resolved("hello").then(null, shouldFail()).getResultNow();
            expect(result).toBe("hello");
            
            result = rejected("goodbye").then(shouldFail(), null).getErrorNow();
            expect(result).toBe("goodbye");

        });
        it("should map", function() {
            var result = resolved("hello").then(function(result) { return result.toUpperCase(); }).getResultNow();
            expect(result).toBe("HELLO");
        });
        it("nested promises get flattened", function() {
            var result = resolved("hello").then(function(result) {
                return resolved(result + " ").then(function(result){
	                return resolved(result + "world");
                });
            }).then(function(result) {
	            return resolved(result + "!");
            }).getResultNow();
            expect(result).toBe("hello world!");
        });
        it("should switch states", function() {
            var result = resolved("success").then(shouldPass(), shouldFail())
                .then(function(result) { return rejected(result + " fail"); })
	            .then(shouldFail(), shouldPass())
                .then(function(result) { return resolved(result + " success"); })
	            .then(shouldPass(), shouldFail())
	            .getResultNow();
	        expect(result).toBe("success fail success");
        });
        it("should catch errors", function() {
            var result = resolved("success").then(shouldPass(), shouldFail())
                .then(function(result) { throw result + " throw"; }, null)
                .then(null, function(error) { throw error + " throw"; })
                .then(null, function(error) { return error + " return"; })
                .then(function(result) { throw result + " throw"; }, null)
                .then(null, function(error) { return error + " return"; })
                .getResultNow();
            expect(result).toBe("success throw throw return throw return");
        });
    });
    
    
});
