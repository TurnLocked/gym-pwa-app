self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('app-cache').then(function(cache) {
            return cache.addAll([
                '/index.html',
                '/style.css',
                '/app.js',
                '/exercises.js',
                '/charts.js'
                // Include any additional files needed for caching
            ]);
        })
    );
});