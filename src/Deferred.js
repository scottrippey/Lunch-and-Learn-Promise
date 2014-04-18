	/* Deferred is a different API that exposes resolve, reject, and promise */
	function Deferred() {
		if (!(this instanceof Deferred)) return new Deferred();

		var deferred = this;
		deferred.promise = new Promise(function(resolve, reject) {
			deferred.resolve = resolve;
			deferred.reject = reject;
		});
		return deferred;
	}
