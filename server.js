var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var ejs = require('ejs');
const { finished } = require('stream');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const flash = require('express-flash');
const session = require('express-session');
const favicon = require('serve-favicon');
let port = process.env.PORT || 3000;

// Require schemas
const Ingredient = require('./models/ingredients');

const initializePassport = require('./passport-config');
// initializePassport(passport, username =>{
//     return bills.find(user => user.username === username)
// });
initializePassport(
    passport,
    username => bills.find(user => user.username === username),
    id => bills.find(user => user.id === id)
);


var app = express();

mongoose.connect('mongodb+srv://thomas:dbPassw123@bar-cluster.nd5tg.mongodb.net/bar-barbara?retryWrites=true&w=majority', { useNewUrlParser: true }, () => {
    console.log('connected to db');
})
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: { _expires: 36000000 }
}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(passport.initialize());
app.use(passport.session());

var ingredientsData = fs.readFileSync('ingredients.json');
var ingredients = JSON.parse(ingredientsData);
var recipesData = fs.readFileSync('recipes.json');
var recipes = JSON.parse(recipesData);
var billsData = fs.readFileSync('bills.json');
var bills = JSON.parse(billsData);
var tijdslotenData = fs.readFileSync('tijdsloten.json');
var tijdsloten = JSON.parse(tijdslotenData);
var ordersData = fs.readFileSync("orders.json");
var orders = JSON.parse(ordersData);
var payedBillsData = fs.readFileSync("payed-bills.json");
var payedBills = JSON.parse(payedBillsData);

app.use(express.static('public'));
// server.use(serveStatic(__dirname + "/client/dist"));
app.set('view engine', 'ejs');


// Handling references
app.get('/', (request, response) => {
    // response.render('pages/index',{name: 'thomas'});
    // if (request.isAuthenticated()){
    //     response.render('pages/index_li', {name: request.user.username});
    // } else {
    //     response.render('pages/index');
    // }
    response.render('pages/index', { li: request.isAuthenticated() });
});
app.get('/register', (request, response) => {
    response.render('pages/register', { li: request.isAuthenticated() });
});
app.get('/login', (request, response) => {
    response.render('pages/login', { li: request.isAuthenticated() });
});
app.get('/special', checkAuthenticated, (request, response) => {
    response.render('pages/special', { li: request.isAuthenticated() });
});
app.get('/drankkaart', (request, response) => {
    response.render('pages/drankkaart', { li: request.isAuthenticated() });
});
app.get('/tijdsloten', (request, response) => {
    response.render('pages/tijdsloten', { li: request.isAuthenticated() })
});
app.get('/admin', (request, response) => {
    response.render('pages/admin');
});

// Handling ingredients/storage
app.post('/ingredients/add', addIngredient);
app.get('/ingredients/:name?', getIngredients);
app.get('/ingredients/remove/:name?', deleteIngredient);
// Handling cocktail recipes
app.post('/addRecipe', addRecipe);
app.get('/recipes/:name?', getRecipes);
app.get('/removerecipe/:name?', deleteRecipe);
// Handling client database
app.post('/addclient', addClient);
app.get('/getclient', getClient);
app.get('/getclients', getClients);
app.get('/deleteclient/:name', deleteClient);
app.get('/adddrink/:drink/:name', addDrink);
app.post('/order', orderDrink);
app.get('/finishorder/:id', finishOrder);
app.get('/deleteorder/:id', deleteOrder);
app.get('/orders', getOrders);
app.get('/payed/:id', payed);
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))
app.get('/logout', (request, response) => {
    request.logout();
    response.redirect('/');
});
app.get('/account', checkAuthenticated, (request, response) => {
    response.render('pages/account', { name: request.user.username, li: request.isAuthenticated() });
});
// Handling timeslots
app.post('/addday', addDay);
app.get('/removeday/:day/:month', removeDay);
app.post('/registerday', registerDay);
app.get('/timeslots', getTimeslots);
app.post('/unregisterday', checkAuthenticated, unregisterDay);
//===========================================================================================\\

function addIngredient(req, res) {
    const newIngredient = new Ingredient({
        name:req.body.name,
        price:req.body.price
    })
    Ingredient.findOne({name:req.body.name}, function(err, doc) {
        if (doc != null){
            res.json({message:"This Ingredient already exists"})
        } else {
            newIngredient.save(function(err, saved){
                if(err) {
                    res.json(savedIngredient);
                } else {
                    res.json(saved);
                }
            });

        }
    });


}

async function getIngredients(req, res) {
    try {
        const ingredients = await Ingredient.find();
        res.json(ingredients);
    } catch (error) {
        res.json({message:error});
    }
}

function deleteIngredient(req, res) {
    var name = req.params.name;
    Ingredient.findOne({name:name}, function(err,doc){
        if(!doc) {
            res.json({message:"There is no such ingredient"})
        } else{
            Ingredient.remove({name:name}, function(err, removed) {
                if(err) {
                    res.json({message:err});
                } else {
                    res.json(removed);
                }
            });
        }
    });
}

//===========================================================================================\\

function getRecipes(request, response) {
    var data = request.params;
    var recipe = data.name;
    if (recipe == undefined) {
        response.send(JSON.stringify(recipes));

    } else {
        recipes.forEach(cocktail => {
            if (cocktail.name == recipe) {
                response.send(JSON.stringify(cocktail));
            }
        });

    }
}


function addRecipe(request, response) {
    var recipe = request.body;
    var contains = false;
    recipes.forEach(cocktail => {
        if (cocktail.name == recipe.name) {
            contains = true;
        }
    });
    if (contains) {
        response.send("recipe already exists");
    } else {
        recipes.push(recipe);

        var parsingData = JSON.stringify(recipes);

        fs.writeFile('recipes.json', parsingData, finished);
        function finished() {
            console.log("added " + recipe);
        }
        response.send(recipes);
    }

}

function deleteRecipe(request, response) {
    var data = request.params;
    var name = data.name;

    if (name == undefined) {
        var keys = Object.keys(recipes);

        if (keys.length < 1) {
            response.send('there are no recipes');
        } else {
            var deleteName = keys.slice(-1)[0];
            delete recipes[deleteName];

            var parsingData = JSON.stringify(recipes);

            fs.writeFile('recipes.json', parsingData, finished);

            function finished(err) {
                console.log('recipe deleted');
                response.send('removed ' + deleteName);
            }
        }
    }
    else {
        recipes.forEach(recipe => {
            if (recipe.name == name) {
                const index = recipes.indexOf(recipe);
                if (index > -1) {
                    recipes.splice(index, 1);
                }
            }
        });
        var parsingData = JSON.stringify(recipes);
        fs.writeFile('recipes.json', parsingData, finished);
        function finished() {
            console.log('recipe removed');
            response.send('removed ' + name);
        }
    }
}

function orderDrink(request, response) {
    var data = request.body;
    if (request.isAuthenticated()) {
        var name = request.user.username;
        var time = data.time;
        var cocktail = data.cocktail;
        var sendingData = {
            name: name,
            cocktail: cocktail,
            time: data.time,
            finished: false,
            id: Date.now().toString()
        };
        orders.push(sendingData);
        var parsingData = JSON.stringify(orders);
        fs.writeFile('orders.json', parsingData, finished);
        function finished() {
            console.log(sendingData);
        }
        bills.forEach(user => {
            if (user.username == name) {
                if (user.card == 9) {
                    user.card = 0;
                } else {
                    user.bill.push(cocktail);
                    user.card++;
                }

            }
        });
        var parsingData = JSON.stringify(bills);
        fs.writeFile('bills.json', parsingData, finished);
        function finished() {
            console.log(sendingData);
        }

        response.send("Done");
    } else {
        response.send("unauthorized");
    }
}

function finishOrder(request, response) {
    var data = request.params;
    var id = data.id;
    orders.forEach(order => {
        if (order.id == id) {
            order.finished = true;
        }
    });
    var parsingData = JSON.stringify(orders);
    fs.writeFile('orders.json', parsingData, finished);
    function finished() {
        console.log(id);
    }
    response.send(id);
}

function deleteOrder(request, response) {
    var data = request.params;
    var id = data.id;
    var drinkName;
    var clientName;

    orders.forEach(order => {
        if (order.id == id) {
            clientName = order.name;
            drinkName = order.cocktail;
            const index = orders.indexOf(order);
            if (index > -1) {
                orders.splice(index, 1);
            }
        }
    });
    bills.forEach(user => {
        if (user.username == clientName) {
            const index = user.bill.indexOf(drinkName);
            if (index > -1) {
                user.bill.splice(index, 1);
            }
        }
    });
    var parsingData = JSON.stringify(orders);
    fs.writeFile('orders.json', parsingData, finished);
    var parsingData = JSON.stringify(bills);
    fs.writeFile('bills.json', parsingData, finished);
    function finished() {
        console.log(id);
    }
    response.send(id);

}

function getOrders(request, response) {
    var sendingOrders = [];
    orders.forEach(order => {
        if (!order.finished) {
            sendingOrders.push(order);
        }
    });
    response.send(JSON.stringify(sendingOrders));
}

//===========================================================================================\\

async function addClient(request, response) {
    var user = request.body;
    try {
        var hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        user.id = Date.now().toString();
        bills.push(user);
        var parsingData = JSON.stringify(bills);
        fs.writeFile('bills.json', parsingData, finished);
        var payedData = {
            username: user.username,
            payed: []
        };
        var parsingData = JSON.stringify(payedData);
        fs.writeFile("payed-bills.json", parsingData, finished);
        function finished() {
            // console.log("added "+ user);
            console.log("NEW USER ADDED");
        }
        response.send('ok');

    } catch {
        console.log("error");
    }
}

function deleteClient(request, response) {
    var data = request.params;
    var name = data.name;

    delete bills[name];
    var parsingData = JSON.stringify(bills);
    fs.writeFile('bills.json', parsingData, finished);
    function finished() {
        console.log(name + ' was deleted');
        response.send(name + ' removed from the client base');
    }
}

function addDrink(request, response) {
    var data = request.params;
    var drink = data.drink;
    var name = data.name;

    bills[name]['drinks'].push(drink);
    var parsingData = JSON.stringify(bills);
    fs.writeFile('bills.json', parsingData, finished);
    function finished() {
        console.log(drink + ' added to ' + name);
        response.send(drink + ' added to ' + name);
    }
}

function payed(request, response) {
    var data = request.params;
    var id = data.id;

    bills.forEach(client => {
        if (client.id == id){
            var payedArray = client.bill;
            client.bill = [];
            payedBills.forEach(element => {
                if(element.username == client.username) {
                    element.payed = payedArray;
                }
            });
        }
    });

    var parsingData = JSON.stringify(bills);
    var parsingData2 = JSON.stringify(payedBills);
    fs.writeFile('bills.json', parsingData, finished);
    fs.writeFile('payed-bills.json', parsingData2, finished);
    function finished() {
        console.log("PAYED");
    }
    response.send(id);
}

function getClient(request, response) {
    var username = request.user.username;
    var user = bills.find(user => user.username === username);
    var parsingData = JSON.stringify(user);
    console.log(parsingData);
    response.send(parsingData);
}

function getClients(request, response) {
    var parsingData = JSON.stringify(bills);
    response.send(parsingData);
}

//========================================================================================\\
function addDay(request, response) {
    var data = request.body;
    tijdsloten.push(data);
    var parsingData = JSON.stringify(tijdsloten);
    fs.writeFile('tijdsloten.json', parsingData, finished);
    function finished() {
        response.send(parsingData);
    }
}

function removeDay(request, response) {
    var data = request.params;
    var day = data.day;
    var month = data.month;
    tijdsloten.forEach(slot => {
        if (slot.day == day && slot.month == month) {
            const index = tijdsloten.indexOf(slot);
            if (index > -1) {
                tijdsloten.splice(index, 1);
            }
        }
    });
    var parsingData = JSON.stringify(tijdsloten);
    fs.writeFile('tijdsloten.json', parsingData, finished);
    function finished() {
        console.log(parsingData);
    }
    response.send("day was deleted");
}

function registerDay(request, response) {
    if (request.isAuthenticated()) {
        var data = request.body;
        var givenDay = data.day;
        var givenMonth = data.month;
        var name = request.user.username;
        var corona = false;
        tijdsloten.forEach(tijdslot => {
            var tijdslotDay = tijdslot.day;
            var tijdslotMonth = tijdslot.month;
            if (givenDay == tijdslotDay && givenMonth == tijdslotMonth) {
                if (!tijdslot.registered.includes(name)) {
                    if(tijdslot.registered.length == 3){
                        corona = true;
                    } else {
                        tijdslot.registered.push(name);
                    }
                }
            }
        });

        var parsingData = JSON.stringify(tijdsloten);
        fs.writeFile('tijdsloten.json', parsingData, finished);
        function finished() {
            console.log(parsingData);
        }
        if (corona) {
            response.send("corona");
        } else {
            response.send(parsingData)
        }
    } else {
        response.send('unauthorized');
    }
}

function getTimeslots(request, response) {
    if (request.isAuthenticated()) {
        var sendingData = [];
        var name = request.user.username;
        tijdsloten.forEach(slot => {
            var sendingSlot = Object.assign({}, slot);;
            if (sendingSlot.registered.includes(name)) {
                sendingSlot.occupied = true;
            }
            sendingData.push(sendingSlot);
        });
        response.send(JSON.stringify(sendingData));
    } else {
        response.send(JSON.stringify(tijdsloten));
    }
}

function unregisterDay(request, response) {
    var name = request.user.username;
    var data = request.body;
    var day = data.day;
    var month = data.month;
    tijdsloten.forEach(slot => {
        if (slot.day == day && slot.month == month) {
            if (slot.registered.includes(name)) {
                const index = slot.registered.indexOf(name);
                if (index > -1) {
                    slot.registered.splice(index, 1);
                }
            }
        }

    });
    var parsingData = JSON.stringify(tijdsloten);
    fs.writeFile('tijdsloten.json', parsingData, finished);
    function finished() {
        response.send(parsingData);
    }
}


//========================================================================================\\

function checkAuthenticated(request, response, next) {
    if (request.isAuthenticated()) {
        return next();
    }
    // response.redirect('/login');
    response.redirect(307, '/login');
}

function checkNotAuthenticated(request, response, next) {
    if (request.isAuthenticated()) {
        response.redirect('/');
    }
    next();
}

app.listen(port, () => {
    console.log("OY CUNT");
});