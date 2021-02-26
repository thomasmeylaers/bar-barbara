$(function (){
    var $tbody = $('#tbody');
    var ingredientsArray=[];


    $.ajax({
        type:'GET',
        url:'http://localhost:3000/ingredients',
        success:(data)=>{
            ingredientsArray = JSON.parse(data);
        }
    });

    $.ajax({
        type: 'GET',
        url:'http://localhost:3000/recipes',
        success:(data)=>{
          var recipes = JSON.parse(data);
          $.each(recipes, function(i,recipe) {
                var ingredientsString = "";
                var price = 0;
                $.each(recipe.ingredients, function(i, ingredient){
                    ingredientsString = ingredientsString.concat(ingredient.ingredient);
                    ingredientsString = ingredientsString.concat(', ');
                    $.each(ingredientsArray, function(i, ingredientData){
                        if(ingredient.ingredient == ingredientData.name){
                            price += Number(ingredientData.price)*Number(ingredient.amount[0])*Number(ingredient.amount[1]);
                        }
                    });
                });

              $tbody.append('<tr><td>'+recipe.name+'</td><td>'+ingredientsString+'</td><td>'+price+'</td><td><button class="bestellen-button" name="'+recipe.name+'">Bestellen</button></td></tr>');
          });
        }
      });

      $("#tbody").on("click", ".bestellen-button", function(event){
        var now = new Date();
        var sendData ={
            cocktail:$(this).attr('name'),
            time: now.toJSON()
        };
        $.ajax("http://localhost:3000/order",{
            method:"POST",
            data: JSON.stringify(sendData),
            contentType: "application/json",
            success: (response, textStatus, xhr) =>{ 
                if (response == 'unauthorized'){
                    window.location.href = "http://localhost:3000/login";
                }
            }
        }); 
        $(this).css('background-color', 'green');
    });
});