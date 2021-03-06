var APP_PREFIX = 'JFDGift_'     // Identifier for this app (this needs to be consistent across every cache update)
var VERSION = 'version_01'              // Version of the off-line cache (change this value everytime you want to update cache)
var CACHE_NAME = APP_PREFIX + VERSION
var URLS = [                            // Add URL you want to cache in this list.
    '/',
    '/index.html',
    '/assets/css/app.css',
    '/assets/fonts/montserrat_bold.woff2',
    '/assets/fonts/montserrat_regular.woff2',
    '/assets/img/Puzzle1Back.png',
    '/assets/img/Puzzle1Front.png',
    '/assets/img/Puzzle2Back.png',
    '/assets/img/Puzzle2Front.png',
    '/assets/img/Puzzle3Back.png',
    '/assets/img/Puzzle3Front.png',
    '/assets/img/PuzzleScreenBack.svg',
    '/assets/js/app.js',
    '/assets/vendor/js/forge.min.js',
    '/assets/vendor/js/mithril.min.js'
]

// Respond with cached resources
self.addEventListener('fetch', function (e) {
    console.log('Fetch request : ' + e.request.url)
    e.respondWith(
        caches.match(e.request).then(function (request) {
            if (request) { // if cache is available, respond with cache
                console.log('Responding with cache : ' + e.request.url)
                return request
            } else {       // if there are no cache, try fetching request
                console.log('File is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }

            // You can omit if/else for console.log & put one line below like this too.
            // return request || fetch(e.request)
        })
    )
})

// Cache resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('Installing cache : ' + CACHE_NAME)
            return cache.addAll(URLS)
        })
    )
})

// Delete outdated caches
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            // `keyList` contains all cache names under your username.github.io
            // filter out ones that has this app prefix to create white list
            var cacheWhitelist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX)
            })
            // add current cache name to white list
            cacheWhitelist.push(CACHE_NAME)

            return Promise.all(keyList.map(function (key, i) {
                if (cacheWhitelist.indexOf(key) === -1) {
                    console.log('Deleting cache : ' + keyList[i])
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
})