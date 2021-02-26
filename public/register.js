$(function(){
    var $username = $('#username');
    var $email = $('#email');
    var $password  = $('#password');
    var $submit = $('#submit');

    $submit.on("click", function(){
        var user = {
            username : $username.val(),
            email : $email.val(),
            password: $password.val(),
            bill:[],
            card:0
        };

        $.ajax("http://localhost:3000/addclient", {
            data: JSON.stringify(user),
            method: "POST",
            contentType: "application/json",
            success: (response) =>{ 
                window.location.replace("http://localhost:3000/login");
            }
        });
    });
});