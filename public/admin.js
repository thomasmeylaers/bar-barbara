$(function() {
    const publicVapidKey = "BAQY-g0nd6wwa3NRSq5Q0DcKReOW28LYZcchoql79C2pu-u9uP8fQr6eGir3BNlmHYbdHFXbcv3prbwy08qYvgA"
    var $test = $('#test');
    var $deleteAll = $('#deleteAll')
    var $register = $('#register')
    var $day = $('#day');
    var $month = $('#month');
    var $addDay = $('#add-day');
    var $removeDay = $('#remove-day');
    var $removeMonth = $('#remove-month');
    var $removeDate = $('#remove-date');
    var $addIngredient = $('#add-ingredient');
    var $amountIngredient = $('#amount-ingredient');
    var $priceIngredient = $('#price-ingredient');
    var $nameIngredient = $('#name-ingredient');
    var $removeName = $('#remove-name');
    var $removeIngredient = $('#remove-ingredient');
    var $nameRecipe = $('#name-recipe');
    var $ingredientRecipe = $('#ingredient-recipe');
    var $amountOption = $('#amount-option option:selected');
    var $saveIngredient = $('#save-ingredient');
    var $doneRecipe = $('#done-recipe');
    var $timesAmount = $('#times-amount');
    var $nameRemoveRecipe = $('#name-remove-recipe');
    var $removeRecipe = $('#remove-recipe');
    var $ordersList = $('#orders-list');
    var $tbody = $('#tbody');
    var availableIngredients = [];
    var pendingOrders = [];
    var savedIngredients = [];
    var recipePrices = {};

    // check for service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('cunt.js').then(function(reg) {
                console.log('Service Worker Registered!', reg);

                reg.pushManager.getSubscription().then(function(sub) {
                    if (sub === null) {
                        // Update UI to ask user to register for Push
                        console.log('Not subscribed to push service!');
                    } else {
                        // We have a subscription, update the database
                        console.log('Subscription object: ', sub);
                    }
                });
            })
            .catch(function(err) {
                console.log('Service Worker registration failed: ', err);
            });
    }

    function subscribeUser() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(function(reg) {

                reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicVapidKey)

                }).then(function(sub) {
                    console.log('Endpoint URL: ', sub.endpoint);
                    fetch("/subscribepush", {
                        method: "POST",
                        body: JSON.stringify(sub),
                        headers: {
                            "content-type": "application/json"
                        }
                    });
                }).catch(function(e) {
                    if (Notification.permission === 'denied') {
                        console.warn('Permission for notifications was denied');
                    } else {
                        console.error('Unable to subscribe to push', e);
                    }
                });
            })
        }
    }

    function displayNotification() {
        if (Notification.permission == 'granted') {
            navigator.serviceWorker.getRegistration().then(function(reg) {
                reg.showNotification('Hello world!');
            });
        }
    }


    function urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, "+")
            .replace(/_/g, "/");

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }



    // register sw, register push, send push
    async function send() {
        // Register Service Worker
        console.log("Registering service worker...");
        const register = await navigator.serviceWorker.register("/cunt.js", {
            scope: "/"
        });
        console.log("");

        // Register Push
        console.log("Registering Push...");
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
        console.log("Push Registered...");

        console.log(register);
        console.log(JSON.stringify(subscription));
        // Send Push Notification
        console.log("Sending Push...");
        await fetch("/subscribe", {
            method: "POST",
            body: JSON.stringify(subscription),
            headers: {
                "content-type": "application/json"
            }
        });
        console.log("Push Sent...");
    }
    $test.on('click', async() => {
        await fetch("/sendnotification", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            }
        });
    })
    $register.on('click', async() => {
        subscribeUser();
    })





    $.ajax({
        type: 'GET',
        url: window.location.origin + '/ingredients',
        success: (data) => {
            console.log(data);
            data.forEach(ingredient => {
                availableIngredients.push(ingredient.name);
            });
        }
    });

    $.ajax({
        type: 'GET',
        url: window.location.origin + '/orders',
        success: (data) => {
            var dataParsed = data;
            dataParsed.forEach(order => {
                if (!order.finished) {
                    pendingOrders.push(order);
                }

            });
            pendingOrders.forEach(order => {
                var time = new Date(order.time);
                $ordersList.append('<li>' + order.name + '|' + order.cocktail + '|' + time.getHours() + ':' + time.getMinutes() + '<button order-id="' + order._id + '" class="finish-order">finish</button><button order-id="' + order._id + '" class="delete-order">Delete</button></li>')
            });
        }
    });

    // Get all the prices of every recipe in an object
    $.ajax({
        type: 'GET',
        url: window.location.origin + '/recipes',
        success: (data) => {
            $.each(data, function(i, recipe) {
                var name = recipe.name;
                var price =  recipe.price + (Math.random() * (0.7 - 0.3) + 0.3);
                recipePrices[name] = price;
            });
        }
    })

    $.ajax({
        type: 'GET',
        url: window.location.origin + '/clients',
        success: (data) => {
            console.log(recipePrices)
            var bills = data;
            bills.forEach(client => {
                var ordersString = "";
                let price =  0;
                client.bill.forEach(drink => {
                    ordersString = ordersString.concat(drink);
                    ordersString = ordersString.concat(", ");
                    
                    price += recipePrices[drink];
                });
                price = Math.round(price*100)/100
                $tbody.append('<tr><td>' + client.username + '</td><td>' + ordersString + '</td><td>'+price+'</td><td><button class="betalen" client-id="' + client.id + '">BETALEN</button></td></tr>')
            });
        }
    });


    $tbody.on("click", ".betalen", function(event) {
        var id = $(this).attr('client-id');
        $.ajax({
            type: 'GET',
            url: window.location.origin + '/payed/' + id,
            success: (data) => {
                console.log(data);
                location.reload();
            }
        });
    });

    $deleteAll.on('click', (e) => {
        $.ajax({
            type: 'GET',
            url: window.location.origin + '/deleteall',
            success: (data) => {
                console.log(data);
                location.reload();
            }
        })
    })

    $ordersList.on("click", ".finish-order", function(event) {
        var id = $(this).attr('order-id');
        $.ajax({
            type: 'GET',
            url: window.location.origin + '/finishorder/' + id,
            success: (data) => {
                location.reload();
            }
        })
    });

    $ordersList.on("click", ".delete-order", function(event) {
        var id = $(this).attr('order-id');
        $.ajax({
            type: 'GET',
            url: window.location.origin + '/deleteorder/' + id,
            success: (data) => {
                location.reload();
            }
        })
    });


    $addDay.on("click", function() {
        var day = $day.val();
        var month = $month.val();
        var sendData = {
            day: day,
            month: month,
            registered: []
        }
        $.ajax(window.location.origin + "/addday", {
            data: JSON.stringify(sendData),
            method: "POST",
            contentType: "application/json",
            success: (response) => {
                console.log(response);
                location.reload();
            }
        });
    });

    $removeDate.on("click", function() {
        var day = $removeDay.val();
        var month = $removeMonth.val();
        $.ajax(window.location.origin + "/removeday/" + day + "/" + month, {
            method: "GET",
            success: (response) => {
                console.log(response);
                location.reload();
            }
        });
    });

    $addIngredient.on("click", function() {
        var sendData = {
            name: $nameIngredient.val(),
            price: $priceIngredient.val() / $amountIngredient.val()
        };
        $.ajax(window.location.origin + "/ingredients/add", {
            data: JSON.stringify(sendData),
            method: "POST",
            contentType: "application/json",
            success: (response) => {
                location.reload();
            }
        });
    });

    $removeIngredient.on("click", function() {
        $.ajax(window.location.origin + "/ingredients/remove/" + $removeName.val(), {
            method: "GET",
            success: (response) => {
                location.reload();
            }
        });
    });

    $saveIngredient.on("click", function() {
        var name = $ingredientRecipe.val();
        var amount = $amountOption.val();
        var times = $timesAmount.val();
        var data = {
            ingredient: name,
            amount: [Number(amount), Number(times)]
        };
        if (availableIngredients.includes(name)) {
            savedIngredients.push(data);
        } else {
            alert('no such ingredient');
        }
        $ingredientRecipe.val('');
        $timesAmount.val('');
    });

    $doneRecipe.on("click", function() {
        var recipeName = $nameRecipe.val().toLowerCase();
        var sendingData = {
            name: recipeName,
            ingredients: savedIngredients
        };

        $.ajax(window.location.origin + "/recipes/add", {
            data: JSON.stringify(sendingData),
            method: "POST",
            contentType: "application/json",
            success: (response) => {
                console.log(response);
                location.reload();
            }
        });
    });

    $removeRecipe.on("click", function() {
        var name = $nameRemoveRecipe.val();
        $.ajax(window.location.origin + "/recipes/remove/" + name, {
            method: "GET",
            success: (response) => {
                console.log(response);
                location.reload();
            }
        });
    });
});