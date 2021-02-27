$(function () {
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

    $.ajax({
        type: 'GET',
        url: window.location.origin+'/ingredients',
        success: (data) => {
            var data = data;
            data.forEach(ingredient => {
                availableIngredients.push(ingredient.name);
            });
        }
    });

    $.ajax({
        type: 'GET',
        url: window.location.origin+'/orders',
        success: (data) => {
            var dataParsed = data;
            dataParsed.forEach(order => {
                pendingOrders.push(order);
            });
            pendingOrders.forEach(order => {
                var time = new Date(order.time);
                $ordersList.append('<li>' + order.name + '|' + order.cocktail + '|' + time.getHours() + ':' + time.getMinutes() + '<button order-id="' + order.id + '" class="finish-order">finish</button><button order-id="' + order.id + '" class="delete-order">Delete</button></li>')
            });
        }
    });

    $.ajax({
        type: 'GET',
        url: window.location.origin+'/clients',
        success: (data) => {
            var bills = data;
            bills.forEach(client => {
                var ordersString = "";
                client.bill.forEach(drink => {
                    ordersString = ordersString.concat(drink);
                    ordersString = ordersString.concat(", ");
                });
                $tbody.append('<tr><td>'+client.username+'</td><td>'+ordersString+'</td><td><button class="betalen" client-id="'+client.id+'">BETALEN</button></td></tr>')
            });
        }
    });

    $tbody.on("click", ".betalen", function(event) {
        var id = $(this).attr('client-id');
        $.ajax({
            type:'GET',
            url: window.location.origin+'/payed/' + id,
            success:(data)=>{
                console.log(data);
                location.reload();
            }
        });
    });

    $ordersList.on("click", ".finish-order", function (event) {
        var id = $(this).attr('order-id');
        $.ajax({
            type: 'GET',
            url:  window.location.origin+'/finishorder/' + id,
            success: (data) => {
                location.reload();
            }
        })
    });

    $ordersList.on("click", ".delete-order", function (event) {
        var id = $(this).attr('order-id');
        $.ajax({
            type: 'GET',
            url:  window.location.origin+'/deleteorder/' + id,
            success: (data) => {
                location.reload();
            }
        })
    });


    $addDay.on("click", function () {
        var day = $day.val();
        var month = $month.val();
        var sendData = {
            day: day,
            month: month,
            registered: []
        }
        $.ajax(window.location.origin+"/addday", {
            data: JSON.stringify(sendData),
            method: "POST",
            contentType: "application/json",
            success: (response) => {
                console.log(response);
                location.reload();
            }
        });
    });

    $removeDate.on("click", function () {
        var day = $removeDay.val();
        var month = $removeMonth.val();
        $.ajax(window.location.origin+"/removeday/" + day + "/" + month, {
            method: "GET",
            success: (response) => {
                console.log(response);
                location.reload();
            }
        });
    });

    $addIngredient.on("click", function () {
        var sendData = {
            name: $nameIngredient.val(),
            price: $priceIngredient.val() / $amountIngredient.val()
        };
        $.ajax(window.location.origin+"/ingredients/add", {
            data: JSON.stringify(sendData),
            method: "POST",
            contentType: "application/json",
            succes: (response) => {
                location.reload();
            }
        });
    });

    $removeIngredient.on("click", function () {
        $.ajax(window.location.origin+"/ingredients/remove/" + $removeName.val(), {
            method: "GET",
            succes: (response) => {
                console.log(response);
            }
        });
    });

    $saveIngredient.on("click", function () {
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

    $doneRecipe.on("click", function () {
        var recipeName = $nameRecipe.val();
        var sendingData = {
            name: recipeName,
            ingredients: savedIngredients
        };

        $.ajax(window.location.origin+"/addrecipe", {
            data: JSON.stringify(sendingData),
            method: "POST",
            contentType: "application/json",
            succes: (response) => {
                console.log(response);
                location.reload();
            }
        });
    });

    $removeRecipe.on("click", function () {
        var name = $nameRemoveRecipe.val();
        $.ajax(window.location.origin+"/removerecipe/" + name, {
            method: "GET",
            succes: (response) => {
                console.log(response);
            }
        });
    });
});