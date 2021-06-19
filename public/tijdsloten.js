$(function (){
    const now = new Date();
    var $add = $('#add');
    var $reserveren = $('#reserveren');
    var $tbody = $('#tbody');
    var $buttons = $('.inschrijven-datum');
    var sendData = {
        day: now.getDate(),
        month: now.getMonth(),
        registered: []
    };
    var day=now.getDate();
    var month = now.getMonth();
    var sendDataRegister = {
        day:day,
        month:month
    }

    function compare( a, b ) {
        if ( a.month < b.month ){
          return -1;
        }
        if ( a.month > b.month ){
          return 1;
        }
        return 0;
      }
    function compare2(a,b){
        if(1==1) {
            if (a.day>b.day){
                return 1;
            }
            if (a.day <b.day) {
                return -1;
            }
        }
        return 0;
    }


    $.ajax(window.location.origin+ "/timeslots",{
        method:"GET",
        success: function(response){
            response.sort(compare);
            // response.sort(compare2)
            // response.sort(compare2)

            var tijdsloten = response;
            var data = (tijdsloten)
            console.log(data);
            $.each(data,function(i,date){
                var day = date.day;
                var month = date.month;
                var registered = date.registered;
                var registeredString = "";
                $.each(registered, function(i, name){
                    registeredString = registeredString.concat(name);
                    registeredString = registeredString.concat(', ');
                });
                if (!date.occupied){
                    $tbody.append('<tr><td>'+day+'/'+month+'</td><td>'+registeredString+'</td><td><button class="inschrijven-datum" day="'+day+'" month="'+month+'">inschrijven</button></td></tr>')
                }else{
                    console.log("HERE");
                    $tbody.append('<tr><td>'+day+'/'+month+'</td><td>'+registeredString+'</td><td><button class="uitschrijven-datum" style="background-color: red;color: white;" day="'+day+'" month="'+month+'">uitschrijven</button></td></tr>')
                }

                
            });
        }
    });

    $("#tbody").on("click", ".inschrijven-datum", function(event){
        var sendData = {
            day: $(this).attr('day'),
            month: $(this).attr('month')
        };
        $.ajax(window.location.origin+"/registerday",{
            method:"POST",
            data: JSON.stringify(sendData),
            contentType: "application/json",
            success: (response, textStatus, xhr) =>{ 
                if (response == 'unauthorized'){
                    window.location.href = window.location.origin+'/login';
                } else if (response == "corona"){ 
                    alert("sorry, corona :(");
                } else{
                    location.reload()
                }
            }
        });
    });

    $("#tbody").on("click", ".uitschrijven-datum", function(event){
        var sendData = {
            day: $(this).attr('day'),
            month: $(this).attr('month')
        };
        $.ajax(window.location.origin+"/unregisterday",{
            method:"POST",
            data: JSON.stringify(sendData),
            contentType: "application/json",
            success: (response, textStatus, xhr) =>{ 
                if (response == 'unauthorized'){
                    window.location.href = window.location.origin+'/login';
                } 
                else {
                    location.reload();
                }
            }
        });
    });

    // $add.on("click", ()=>{
    //     $.ajax(window.location.origin+'/addday", {
    //         data: JSON.stringify(sendData),
    //         method: "POST",
    //         contentType: "application/json",
    //         success: (response) =>{ 
    //             alert(response);
    //         }
    //     });
    // });
    // $reserveren.on("click", ()=>{
    //     $.ajax(window.location.origin+'/registerday", {
    //         data: JSON.stringify(sendDataRegister),
    //         method: "POST",
    //         contentType: "application/json",
    //         success: (response, textStatus, xhr) =>{ 
    //             if (response == 'unauthorized'){
    //                 window.location.href = window.location.origin+'/login";
    //             }
    //         }
    //     });
    // });
});