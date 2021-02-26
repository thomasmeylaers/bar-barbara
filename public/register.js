$(function(){
    var $username = $('#username');
    var $email = $('#email');
    var $password  = $('#password');
    var $submit = $('#submit');

    function isEmail(email) {
        var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return regex.test(email);
    }

    $submit.on("click", function(){
        var user = {
            username : $username.val(),
            email : $email.val(),
            password: $password.val(),
            bill:[],
            card:0
        };

        if (isEmail($email.val())){
            $.ajax(window.location.origin+"/addclient", {
                data: JSON.stringify(user),
                method: "POST",
                contentType: "application/json",
                success: (response) =>{ 
                    window.location.replace(window.location.origin+"/login");
                }
            });
        } else{
            alert("Please enter a valid e-mail");
            location.reload();
        }


    });
});