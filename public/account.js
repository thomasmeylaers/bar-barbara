$(function() {
    var $coinsAmount = $('#coins-amount');
    var $rekening = $('#rekening');

    $.ajax({
        type: 'GET',
        url: window.location.origin + '/getClient',
        success: (data) => {
            var user = data;
            console.log(typeof user);
            console.log(user);
            if (10 - user.card == 0) {
                $coinsAmount.html('<p>De volgende cocktail is gratis!</p>');
            } else {
                $coinsAmount.html('<p>Jij moet nog ' + (10 - user.card) + ' cocktails drinken voor een gratis cocktail!</p>');
            }

            $.each(user.bill, function(i, value) {
                $rekening.append('<li>' + value + '</li>');
            });
            //     $.each(ingredients, function(key, value){
            //       $ingredients.append('<li>'+key+':'+value);
            //     });
        }
    });
});