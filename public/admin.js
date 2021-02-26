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
    var availableIngredients = [];
    var pendingOrders = [];
    var savedIngredients = [];

    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/ingredients',
        success: (data) => {
            var data = JSON.parse(data);
            data.forEach(ingredient => {
                availableIngredients.push(ingredient.name);
            });
        }
    });

    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/orders',
        success: (data) => {
            var dataParsed = JSON.parse(data);
            dataParsed.forEach(order => {
                pendingOrders.push(order);
            });
            pendingOrders.forEach(order => {
                var time = new Date(order.time);
                $ordersList.append('<li>' + order.name + '|' + order.cocktail + '|' + time.getHours() + ':' + time.getMinutes() + '<button order-id="' + order.id + '" class="finish-order">finish</button><button order-id="' + order.id + '" class="delete-order">Delete</button></li>')
            });
        }
    });

    $ordersList.on("click", ".finish-order", function (event) {
        var id = $(this).attr('order-id');
        $.ajax({
            type: 'GET',
            url:  'http://localhost:3000/finishorder/' + id,
            success: (data) => {
                location.reload();
            }
        })
    });

    $ordersList.on("click", ".delete-order", function (event) {
        var id = $(this).attr('order-id');
        $.ajax({
            type: 'GET',
            url:  'http://localhost:3000/deleteorder/' + id,
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
        $.ajax("http://localhost:3000/addday", {
            data: JSON.stringify(sendData),
            method: "POST",
            contentType: "application/json",
            success: (response) => {
                console.log(response);
            }
        });
    });

    $removeDate.on("click", function () {
        var day = $removeDay.val();
        var month = $removeMonth.val();
        $.ajax("http://localhost:3000/removeday/" + day + "/" + month, {
            method: "GET",
            success: (response) => {
                console.log(response);
            }
        });
    });

    $addIngredient.on("click", function () {
        var sendData = {
            name: $nameIngredient.val(),
            price: $priceIngredient.val() / $amountIngredient.val()
        };
        $.ajax("http://localhost:3000/addingredient", {
            data: JSON.stringify(sendData),
            method: "POST",
            contentType: "application/json",
            succes: (response) => {
                console.log(response);
            }
        });
    });

    $removeIngredient.on("click", function () {
        $.ajax("http://localhost:3000/deleteingredient/" + $removeName.val(), {
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

        $.ajax("http://localhost:3000/addrecipe", {
            data: JSON.stringify(sendingData),
            method: "POST",
            contentType: "application/json",
            succes: (response) => {
                console.log(response);
            }
        });
    });

    $removeRecipe.on("click", function () {
        var name = $nameRemoveRecipe.val();
        $.ajax("http://localhost:3000/removerecipe/" + name, {
            method: "GET",
            succes: (response) => {
                console.log(response);
            }
        });
    });
});