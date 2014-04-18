	function xhr(options) {

		var req = new XMLHttpRequest();

		req.open(options.method, options.url, true);

		req.onreadystatechange = function() {
			if (req.readyState === 4) {
				if (req.status === 200) {

				} else {

				}
			}
		};

		req.send();

	}
	xhr.json = function(options) {

	};
