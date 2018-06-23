const imageCache = "images";

self.addEventListener("fetch", function (event) {
	if (!navigator.onLine) {
		event.respondWith(
			caches.open(imageCache)
			.then(
				cache => {
					return cache.match(event.request)
					.then(response => {
						if(!response) {
							return caches.match("/offline.jpg")
								.then(offResponse => {
									return offResponse;
								});
						}
					return response;
				})
			}
		)
		);
	} else {
		console.log("URL ", event.request.url);
		event.respondWith(fromCacheFirst(event.request));
	}
});

//Listen to install event
self.addEventListener('install', function (event) {
	self.skipWaiting();
});


//Listen to activate event
self.addEventListener('activate', function(event) {
	event.waitUntil(
	  caches.keys().then(function(cacheNames) {
		return Promise.all(
		  cacheNames.filter(function(cacheName) {
			  return true;
			// Return true if you want to remove this cache,
			// but remember that caches are shared across
			// the whole origin
		  }).map(function(cacheName) {
			return caches.delete(cacheName);
		  })
		).then(() => {
			return caches.open(imageCache).then(function (cache) {
				return cache.addAll(
					['/offline.jpg']
				);
			})
		});
	  })
	);
  });

function fromCacheFirst(request) {
	return caches.open(imageCache)
		.then(cache => {
			return cache.match(request)
				.then(response => {
					return response || fetch(request)
						.then(response => {
							cache.put(request, response.clone());
							return response;
						});
				});
		});
}