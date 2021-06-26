$(function() {
    var $tbody = $('#tbody');
    var ingredientsArray = [];
    var blackList = ["martini dry", "vodkatini"];


    $.ajax({
        type: 'GET',
        url: window.location.origin + '/ingredients',
        success: (data) => {
            ingredientsArray = data;
        }
    });

    $.ajax({
        type: 'GET',
        url: window.location.origin + '/recipes',
        success: (data) => {
            var recipes = data;
            $.each(recipes, function(i, recipe) {
                if (!blackList.includes(recipe.name)) {
                    var ingredientsString = "";
                    var price =  recipe.price + (Math.random() * (0.7 - 0.3) + 0.3);
                    price = Math.round(price * 100) / 100
                    $.each(recipe.ingredients, function(i, ingredient) {
                        ingredientsString = ingredientsString.concat(ingredient.ingredient);
                        ingredientsString = ingredientsString.concat(', ');
                        // $.each(ingredientsArray, function(i, ingredientData){
                        //     if(ingredient.ingredient == ingredientData.name){
                        //         // ZONDER WINST
                        //         price += Number(ingredientData.price)*Number(ingredient.amount[0])*Number(ingredient.amount[1]);
    
                        //         // MET WINST
    
                        //     }
                        // });
                    });
    
                    $tbody.append('<tr><td>' + recipe.name + '</td><td>' + ingredientsString + '</td><td>' + price + '</td><td><button class="bestellen-button" name="' + recipe.name + '">Bestellen</button></td></tr>');
                } 

            });
        }
    });

    $("#tbody").on("click", ".bestellen-button", function(event) {
        var now = new Date();
        var sendData = {
            cocktail: $(this).attr('name'),
            time: now.toJSON()
        };
        var sendDataNotification = {
            cocktail: $(this).attr('name'),

        }

        $.ajax(window.location.origin + "/order", {
            method: "POST",
            data: JSON.stringify(sendData),
            contentType: "application/json",
            success: (response, textStatus, xhr) => {
                if (response == 'unauthorized') {
                    window.location.href = window.location.origin + "/login";
                } else {
                    $.ajax(window.location.origin + "/sendnotification", {
                        method: "POST",
                        data: JSON.stringify(sendDataNotification),
                        contentType: "application/json",
                        success: () => {
                            location.reload();
                        }
                    });
                }
            }
        });

        $(this).css('background-color', 'green');

    });
});