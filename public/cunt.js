self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  const WouteriseenHoer = "wouteriseenhoer";
  self.registration.showNotification(data.title, {
    body: "PLS HELP MIJ AUB",
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
      clients.openWindow('https://www.bar-barbara.com/admin');

      notification.close();
    }
  });