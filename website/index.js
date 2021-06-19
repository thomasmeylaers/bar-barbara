// let ingredients;    
// fetch('/ingredients').then(
//         function(u){ return u.json();}
//       ).then(
//         function(json){
//             jsondata = json;
//             console.log(jsondata['rum']+jsondata['gin']);
//         }
//       );

$(function (){
  var $ingredients = $('#ingredients');
  var $name = $('#name');
  var $ingredient = $('#ingredient');
  var $amount = $('#amount');
  $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/ingredients',
    success: function(data) {
      var ingredients = JSON.parse(data);
      $.each(ingredients, function(key, value){
        $ingredients.append('<li>'+key+':'+value);
      });
    }
  });

  $('#add-order').on("click", function(){
    var nameInput = $name.val();
    var ingredientInput = $ingredient.val();
    var amount = $amount.val();

    var recipe ={
      name : "libre",
      ingredients: [{
          ingredient:"rum",
          amount:[1]
      }, {
          ingredient:"cola",
          amount:[1,2]
      }]
  };

    $.ajax("http://localhost:3000/addrecipe", {
      data: JSON.stringify(recipe),
      method: "POST",
      contentType: "application/json"
   });
    });
});