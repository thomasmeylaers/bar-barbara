console.log("HEY");

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  self.registration.showNotification(data.title, {
    body: "NIEUWE BESTELLING",
    icon: "barbara.jpg"
  });
});

self.addEventListener('notificationclick', function(e) {
    var notification = e.notification;
    // var primaryKey = notification.data.primaryKey;
    var action = e.action;
  
    if (action === 'close') {
      notification.close();
    } else {
      clients.openWindow('https://bar-barbara.herokuapp.com/admin');

      notification.close();
    }
  });