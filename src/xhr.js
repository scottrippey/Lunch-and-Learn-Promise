function xhr(options) {
	var promise = new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open(options.method || 'GET', options.url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					resolve(xhr.responseText);
				} else {
					reject(xhr);
				}
			}
		};
		xhr.send();
	});
	if (options.autoRetry) {
		promise = promise.then(null, function(xhr) {
			options.autoRetry--;
			return xhr(options);
		});
	}
	return promise;
}
xhr.json = function(options) {
	return xhr(options).then(function(responseText) { return JSON.parse(responseText); });
};
