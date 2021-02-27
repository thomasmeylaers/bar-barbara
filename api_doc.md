API


INGREDIENTS
ingredient form
[
    {
        "name":"rum",
        "price": 0.5
    }
]
add ingredient:
GET: /addingredient/:name/:price?

ingredient list:
GET: /ingredients/:ingredient?

delete ingredient: (deletes last ingredient added if there is no name given)
GET: /deleteingredient/:name?




RECIPES
recipe form 
[
    {
        "name" : "cuba libre",
        "ingredients": [{
            "ingredient":"rum",
            "amount":[1]
        }, {
            "ingredient":"cola",
            "amount":[1,2]
        }]
    }

]
add recipe:
POST: /addrecipe

CLIEN
client form
[
    {
        "username":"thomas",
        "email":"thomas@gmail.com",
        "password":"abc",
        "bill":["cuba_libre","copa_cabana"],
        "card": 2
    }
]

TIJDSLOTEN
weekend is vrijdag en zaterdag (day 5 and 6)
tijdsloten form
[
    {
        "weekend":1,
        "friday":{
            "date": date,
            "clients":["thomas", "loran"]
        },
        "saturday":{
            "date": date,
            "clients":["karl", "cedric"]   
        }
    },
    {

    }
]

ORDER
{
    "name": "q",
    "cocktail": "test",
    "time": "2021-02-26T18:24:29.138Z",
    "finished": true,
    "id": "1614363869143"
}