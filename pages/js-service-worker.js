const CACHE_VERSION = 1;
const CURRENT_CACHES = {
  prefetch: 'v' + CACHE_VERSION,
  // other_cache: 'v' + OTHER_CACHE_VERSION
};
const cached_key='cached';

self.addEventListener('install', event => {
  var now = Date.now();
  var urlsToPrefetch = [
    // 'index.html',
    // './', // Alias for index.html
    'images/wide.jpg',
    'images/sw-lifecycle.png',
    'images/rock.jpg',
    'images/workplace.jpg',
    'images/paris.jpg',
    'images/mac.jpg'
  ];
  event.waitUntil(
    // caches.open(CURRENT_CACHES.prefetch).then(function(cache) {
    //   return cache.addAll(urlsToPrefetch);
    // });
    caches.open(CURRENT_CACHES.prefetch).then(cache => {

      var cachePromises = urlsToPrefetch.map(urlToPrefetch => {
        var url = new URL(urlToPrefetch, location.href);
        url.search += (url.search?'&':'?')+cached_key+'=' + now;

        // if there is any chance that the resources
        // are served off of a server that doesnt support CORS
        var request = new Request(url,{mode:'no-cors'});

        return fetch(request).then(response => {
          if (response.status >= 400) {
            throw new Error('request for ' + urlToPrefetch +
              ' failed with status ' + response.statusText);
          }
          // Use the original URL without the cache-busting parameter as the key for cache.put().
          return cache.put(urlToPrefetch, response);
        }).catch(error => {
          console.error('Not caching ' + urlToPrefetch + ' due to ' + error);
        });
      });
      return Promise.all(cachePromises).then(() => {
        // console.log(CURRENT_CACHES.prefetch+' prefetched');
      });
    })
    // .then(self.skipWaiting())
    .catch(error => {
      console.error('prefetching failed:', error);
    })
    // caches.has('v1').then(function(hasCache) {
    //   if (!hasCache) {
    //     someCacheSetupfunction();
    //   } else {
    //     caches.open('v1').then(function(cache) {
    //       return cache.addAll(myAssets);
    //     });
    //   }
    // }).catch(function() {
    //   // Handle exception here.
    // });
  );
});

self.addEventListener('activate', event => {
  event.waitUntil( async function() {
    // clients loaded in the same scope do not need to be reloaded
    // before their fetches will go through this service worker :
    clients.claim();

    // delete all caches that aren't named in CURRENT_CACHES
    var expectedCacheNames = Object.values(CURRENT_CACHES);
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it
            console.log('deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })

    // // enable navigation preloads
    // if (self.registration.navigationPreload) {
    //   await self.registration.navigationPreload.enable();
    // }
  }());
});

self.addEventListener('fetch', event => {
  // avoid non-GET requests
  if ( event.request.method != 'GET') return;
  // && event.request.headers.get('accept').indexOf('text/html') !== -1

  event.waitUntil(async function() {
    // Exit early if we don't have access to the client.
    // Eg, if it's cross-origin.
    if (!event.clientId) return;
    // Get the client.
    const client = await clients.get(event.clientId);
    // Exit early if we don't get the client.
    // Eg, if it closed.
    if (!client) return;
    // Send a message to the client.
    self.clients.matchAll().then(function (clients) {
      clients.forEach(function(client) {
        // client.postMessage("Hey ["+event.clientId+"],<br>serviceWorker is fetching or looking in cache...");
      });
    });
  }());

  event.respondWith(caches.match(event.request).then(r => {
    // console.log( r ? 'cache: '+r.url : 'no cache, need to fetch...' );
    return r || fetch(event.request).then(response => {
      caches.open(CURRENT_CACHES.prefetch).then(cache => {
        cache.put(event.request, response);
      });
      console.log('fetched: ', response.url);
      return response.clone();
      // return cache.put(event.request, response.clone()).then(() => {
      //   return response;
      // });
    }).catch(() => {
      // return caches.match('/sw-test/gallery/myLittleVader.jpg');
      console.error('no cache, fetching failed: ', error);
      throw error;
    });
  }));

  // // fallback response
  // var response;
  // event.respondWith(caches.match(event.request).catch(function() {
  //   return fetch(event.request);
  // }).then(function(r) {
  //   response = r;
  //   caches.open('v1').then(function(cache) {
  //     cache.put(event.request, response);
  //   });
  //   return response.clone();
  // }).catch(function() {
  //   return caches.match('/sw-test/gallery/myLittleVader.jpg');
  // }));

});

function send_message_to_all_clients(msg){
  clients.matchAll().then(clients => {
    clients.forEach(client => {
      send_message_to_client(client, msg).then(m => console.log(m));
    })
  })
}
function send_message_to_client(client, msg){
  return new Promise(function(resolve, reject){
    var msg_channel = new MessageChannel();
    msg_channel.port1.onmessage = function(event){
      if(event.data.error){
        reject(event.data.error);
      }else{
        resolve(event.data);
      }
    };
    client.postMessage("serviceWorker message: >>>"+msg+"<<<", [msg_channel.port2]);
  });
}
self.addEventListener('message', event => {
  if (event.ports[0]) { // client channel messaging
    event.ports[0].postMessage("Hello back! to serviceWorker client ["+event.data+"]");
  }
  // response to any message
  send_message_to_all_clients("serviceWorker received message: " + event.data);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  send_message_to_all_clients("client notification data: " + event.notification.data);

  self.registration.showNotification("google.com was opened (click to reopen)", {
    actions: [{action: "get", title: "Get now.", icon: 'images/cellphone.jpg'}],
    body: 'Buzz! Buzz!',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    tag: 'vibration-sample',
    icon: 'images/cellphone.jpg',
    badge: 'images/cellphone.jpg',
    image: 'images/cellphone.jpg',
    dir: 'ltr',
    data: 'serviceWorker notification data'
    // lang:en-US,
    // renotify:false|true,
    // requireInteraction:false|true,
    // vibrate:pattern,
    // data:data
  });

  // focus on domain window or open
  event.waitUntil(
    clients.matchAll({
      type: "window"
    }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (
          client.url == 'https://www.google.com/' &&
          'focus' in client
        ) {
          if(!client.focused) return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('https://www.google.com/');
    }));
  }

);

self.addEventListener('push', function(event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }
  var data = {};
  if (event.data) {
    data = event.data.json();
    // event.data.text();
    // event.data.blob();
    // event.data.arrayBuffer();
  }
  if(data.action === 'subscribe' || data.action === 'unsubscribe') {
    var title = data.title || "Something Has Happened";
    var message = data.message || "Here's something you might want to check out.";
    // var icon = "../images/new-notification.png";
    var notification = new Notification(title, {
      body: message,
      tag: 'simple-push-demo-notification'
      // , icon: icon
    });
    notification.addEventListener('click', function() {
      if (clients.openWindow) {
        // clients.openWindow('https://example.blog.com/2015/03/04/something-new.html');
      }
    });
    port.postMessage(data);
  } else if(data.action === 'init' || data.action === 'chatMsg') {
    port.postMessage(data);
  }

  event.waitUntil(
    self.registration.showNotification('Yay a message.', {
      body: 'We have received a push message.',
      icon: '/images/icon-192x192.png',
      tag: 'simple-push-demo-notification-tag'
    })
  );
  // var dataInit = {
  //   data : 'Some sample text'
  // }
  // var myPushEvent = new PushEvent('push', dataInit);
  // myPushEvent.data.text(); // should return 'Some sample text'
});

self.addEventListener('pushsubscriptionchange', function() {
  // do something, usually resubscribe to push and
  // send the new subscription details back to the
  // server via XHR or Fetch
});
