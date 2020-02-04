// cf web-push client example
// https://github.com/alex-friedl/webpush-example/blob/master/client/service-worker.js

self.addEventListener('install', function () {
  self.skipWaiting()
})

self.addEventListener('push', function (event) {
  console.log('Received a push message', event)
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon
    })
  )
})

self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification.tag)
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close()

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: 'window'
      })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i]
          if (client.url === '/' && 'focus' in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})
