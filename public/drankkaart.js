$(function() {
    var $tbody = $('#tbody');
    var ingredientsArray = [];


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
                var ingredientsString = "";
                var price = recipe.price;
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
            });
        }
    });

    $("#tbody").on("click", ".bestellen-button", function(event) {
        var now = new Date();
        var sendData = {
            cocktail: $(this).attr('name'),
            time: now.toJSON()
        };

        $.ajax(window.location.origin + "/order", {
            method: "POST",
            data: JSON.stringify(sendData),
            contentType: "application/json",
            success: (response, textStatus, xhr) => {
                if (response == 'unauthorized') {
                    window.location.href = window.location.origin + "/login";
                } else {
                    console.log("IMG HERE");
                    $.ajax(window.location.origin + "/sendnotification", {
                        method: "POST",
                        contentType: "application/json"
                    });
                }
            }
        });

        $(this).css('background-color', 'green');
        location.reload();
    });
});