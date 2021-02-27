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
const Recipe = require('./models/recipes');
const Bills = require('./models/bills');
const Order = require('./models/order');
const Tijdsloten = require('./models/tijdsloten');

// const initializePassport = require('./passport-config');
// initializePassport(
//     passport,
//     username => bills.find(user => user.username === username),
//     id => bills.find(user => user.id === id)
// );

// initializePassport(
//     passport,
//     username => getByUsername(username),
//     id => getById(id)
// );

require('./passport')(passport);

function getByUsername(username) {
    // var ape = {};
    // Bills.find({username:username}, function(err, data) {
    //     console.log("ape1:");
    //     console.log(ape);
    //     ape = data
    //     console.log("ape2:");
    //     console.log(ape);
    //     return ape;
    // });
    // console.log("ape3");
    // console.log(ape);
}

function getById(id) {
    var num;
    Bills.findOne({ id: id }, function (err, data) {
        if (err) {
            return 0;
        } else {
            num = data;
        }
    });
    return num;
}


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
app.post('/recipes/add', addRecipe);
app.get('/recipes/:name?', getRecipes);
app.get('/recipes/remove/:name', deleteRecipe);
// Handling client database
app.post('/clients/add', addClient);
app.get('/getclient', getClient);
app.get('/clients', getClients);
app.get('/clients/remove/:name', deleteClient);
app.post('/order', orderDrink);
app.get('/finishorder/:id', finishOrder);
app.get('/deleteorder/:id', deleteOrder);
app.get('/orders', getOrders);
app.get('/payed/:id', payed);
app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));
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
        name: req.body.name,
        price: req.body.price
    })
    Ingredient.findOne({ name: req.body.name }, function (err, doc) {
        if (doc != null) {
            res.json({ message: "This Ingredient already exists" })
        } else {
            newIngredient.save(function (err, saved) {
                if (err) {
                    res.json({ message: errr });
                } else {
                    res.json(saved);
                }
            });

        }
    });


}

function getIngredients(req, res) {
    var name = req.params.name;
    if (name) {
        Ingredient.findOne({ name: name }, function (err, data) {
            if (err) {
                res.json({ message: err })
            } else {
                res.json(data);
            }
        });
    } else {
        Ingredient.find(function (err, doc) {
            if (err) {
                res.json({ message: err })
            } else {
                res.json(doc);
            }
        });
    }
}

function deleteIngredient(req, res) {
    var name = req.params.name;
    Ingredient.findOne({ name: name }, function (err, doc) {
        if (!doc) {
            res.json({ message: "There is no such ingredient" })
        } else {
            Ingredient.deleteOne({ name: name }, function (err, removed) {
                if (err) {
                    res.json({ message: err });
                } else {
                    res.json('removed');
                }
            });
        }
    });
}

//===========================================================================================\\

function getRecipes(req, res) {
    var name = req.params.name;
    if (name) {
        Recipe.findOne({ name: name }, function (err, data) {
            if (err) {
                res.json({ message: err })
            } else {
                res.json(data)
            }
        });
    } else {
        Recipe.find(function (err, doc) {
            if (err) {
                res.json({ message: err })
            } else {
                res.json(doc);
            }
        });
    }
}


function addRecipe(req, res) {
    const newRecipe = new Recipe(req.body);
    Recipe.findOne({ name: req.body.name }, function (err, data) {
        if (data) {
            res.json({ message: "recipe already exists" })
        } else {
            newRecipe.save(function (err, saved) {
                if (err) {
                    res.json({ message: err });
                } else {
                    res.json(saved);
                }
            });
        }
    });
}

function deleteRecipe(req, res) {
    var name = req.params.name;
    Recipe.findOne({ name: name }, function (err, doc) {
        if (!doc) {
            res.json({ message: "There is no such recipe" })
        } else {
            Recipe.remove({ name: name }, function (err, removed) {
                if (err) {
                    res.json({ message: err });
                } else {
                    res.json(removed);
                }
            });
        }
    });
}

function orderDrink(req, res) {
    var data = req.body;
    if (req.isAuthenticated()) {
        var name = req.user.username;
        var time = data.time;
        var cocktail = data.cocktail;
        var sendingData = {
            name: name,
            cocktail: cocktail,
            time: data.time,
            finished: false
        };
        var newOrder = new Order(sendingData);
        newOrder.save(function (err, saved) {
            if (err) {
                console.log('err');
            } else {
                console.log('saved');
            }
        })

        // bills.forEach(user => {
        //     if (user.username == name) {
        //         if (user.card == 9) {
        //             user.card = 0;
        //         } else {
        //             user.bill.push(cocktail);
        //             user.card++;
        //         }

        //     }
        // });
        Bills.findOne({ username: name }, function (err, data) {
            if (err) {
                res.json({ message: err })
            } else {
                var card = data.card;
                if (card == 10) {
                    Bills.updateOne({ username: name }, { $set: { card: 0 } }, function (err, data) {
                        if (err) {
                            res.json({ message: err })
                        } else {
                            res.json(data);
                        }
                    })
                } else {
                    console.log("im here");
                    Bills.updateOne({ username: name }, { $push: { bill: cocktail } }, function (err, data) {
                        if (err) {
                            res.json({ message: err })
                        } else {

                            var newCard = card + 1;
                            Bills.updateOne({ username: name }, { $set: {card:newCard} }, function(err,data){
                                if (err) {
                                    res.json({ message: err })
                                } else {
                                    res.json(data);
                                }
                            })
                        }
                    })
                }
            }
        })
    } else {
        res.send("unauthorized");
    }
}

function finishOrder(req, res) {
    var data = req.params;
    var id = data.id;
    Order.updateOne({ _id: id }, { $set: { finished: true } }, function (err, data) {
        if (err) {
            res.json({ message: err });
        } else {
            res.json(data);
        }
    })
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

function getOrders(req, res) {
    Order.find(function (err, data) {
        if (err) {
            res.json({ message: err })
        } else {
            res.json(data);
        }
    })
}

//===========================================================================================\\

async function addClient(req, res) {
    var user = req.body;
    try {
        var hashedPassword = await bcrypt.hash(user.password, 10);
        user.password = hashedPassword;
        user.id = Date.now().toString();
        // bills.push(user);
        // var parsingData = JSON.stringify(bills);
        // fs.writeFile('bills.json', parsingData, finished);
        const newClient = new Bills(user);
        Bills.findOne({ username: user.username }, function (err, data) {
            if (err) {
                res.json({ message: err })
            } else {
                if (data != null) {
                    res.json({ message: "This user already exists" })
                } else {
                    newClient.save(function (err, saved) {
                        if (err) {
                            res.json({ message: err })
                        } else {
                            res.json(saved);
                        }
                    });
                }
            }
        });
        // var payedData = {
        //     username: user.username,
        //     payed: []
        // };
        // var parsingData = JSON.stringify(payedData);
        // fs.writeFile("payed-bills.json", parsingData, finished);
        // function finished() {
        //     // console.log("added "+ user);
        //     console.log("NEW USER ADDED");
        // }
        // response.send('ok');

    } catch {
        console.log("error");
    }
}

function deleteClient(request, response) {
    var data = request.params;
    var name = data.name;
    Ingredient.findOne({ username: name }, function (err, data) {
        if (err) {
            res.json({ message: err })
        } else {
            if (!data) {
                res.json({ message: "no user found" })
            } else {
                Bills.remove({ username: name }, function (err, removed) {
                    if (err) {
                        res.json({ message: err })
                    } else {
                        res.json(removed);
                    }
                })
            }
        }
    })
}

function payed(request, response) {
    var data = request.params;
    var id = data.id;

    bills.forEach(client => {
        if (client.id == id) {
            var payedArray = client.bill;
            client.bill = [];
            payedBills.forEach(element => {
                if (element.username == client.username) {
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

function getClient(req, res) {
    var username = req.user.username;
    Bills.findOne({ username: username }, function (err, data) {
        if (err) {
            res.json({ message: err });
        } else {
            res.json(data);
        }
    });
}

function getClients(req, res) {
    Bills.find(function (err, data) {
        if (err) {
            res.json({ message: err })
        } else {
            res.json(data)
        }
    })
}

//========================================================================================\\
function addDay(req, res) {
    var data = req.body;
    var newTijdslot = new Tijdsloten(data);
    newTijdslot.save(function(err,saved) {
        if(err) {
            res.json({message:err})
        } else{
            res.json(saved);
        }
    })
}

function removeDay(req, res) {
    var data = req.params;
    var day = data.day;
    var month = data.month;

    Tijdsloten.remove({day:day,month:month}, function(err,data){
        if(err){
            res.json({message:err})
        } else{
            res.json(data)
        }
    })
}

function registerDay(req, res) {
    if (req.isAuthenticated()) {
        var data = req.body;
        var givenDay = data.day;
        var givenMonth = data.month;
        var name = req.user.username;
        var corona = false;
        // tijdsloten.forEach(tijdslot => {
        //     var tijdslotDay = tijdslot.day;
        //     var tijdslotMonth = tijdslot.month;
        //     if (givenDay == tijdslotDay && givenMonth == tijdslotMonth) {
        //         if (!tijdslot.registered.includes(name)) {
        //             if (tijdslot.registered.length == 3) {
        //                 corona = true;
        //             } else {
        //                 tijdslot.registered.push(name);
        //             }
        //         }
        //     }
        // });

        Tijdsloten.find(function(err,data){
            if(err){
                res.json({message:err})
            } else {
                data.forEach(tijdslot => {
                    if(givenDay == tijdslot.day && givenMonth == tijdslot.month) {
                        if(tijdslot.registered.length >= 3) {
                            corona = true;
                            res.send("corona")
                        } else {
                            Tijdsloten.updateOne({_id:tijdslot._id}, {$push:{registered:name}}, function(err, data) {
                                if (err) {
                                    res.json({message:err});
                                } else {
                                    res.json(data)
                                }
                            });
                        }
                    }

                });
            }
        })

        // var parsingData = JSON.stringify(tijdsloten);
        // fs.writeFile('tijdsloten.json', parsingData, finished);
        // function finished() {
        //     console.log(parsingData);
        // }
        // if (corona) {
        //     response.send("corona");
        // } else {
        //     response.send(parsingData)
        // }
    } else {
        res.send('unauthorized');
    }
}

function getTimeslots(req, res) {
    if (req.isAuthenticated()) {
        // var sendingData = [];
        // var name = req.user.username;
        // tijdsloten.forEach(slot => {
        //     var sendingSlot = Object.assign({}, slot);;
        //     if (sendingSlot.registered.includes(name)) {
        //         sendingSlot.occupied = true;
        //     }
        //     sendingData.push(sendingSlot);
        // });
        // res.send(JSON.stringify(sendingData));
        Tijdsloten.find(function (err,data) {
            if (err) {
                res.json({message:err})
            } else {
                var name = req.user.username;
                var sendingData = []
                data.forEach(tijdslot => {
                    if(tijdslot.registered.includes(name)){
                        tijdslot.occupied = true;
                        console.log(tijdslot);
                    }
                    sendingData.push(tijdslot);
                });
                console.log(sendingData);
                res.json(sendingData);
            }
        })
    } else {
        Tijdsloten.find(function (err, data) {
            if(err) {
                res.json({message:err})
            } else{
                res.json(data);
            }
        })
    }
}

function unregisterDay(req, res) {
    var name = req.user.username;
    var data = req.body;
    var day = data.day;
    var month = data.month;
    // tijdsloten.forEach(slot => {
    //     if (slot.day == day && slot.month == month) {
    //         if (slot.registered.includes(name)) {
    //             const index = slot.registered.indexOf(name);
    //             if (index > -1) {
    //                 slot.registered.splice(index, 1);
    //             }
    //         }
    //     }

    // });
    // var parsingData = JSON.stringify(tijdsloten);
    // fs.writeFile('tijdsloten.json', parsingData, finished);
    // function finished() {
    //     response.send(parsingData);
    // }
    Tijdsloten.updateOne({day:day,month:month}, {$pull:{registered:name}}, function(err, data){
        if (err){
            res.json({message:err})
        } else{
            res.json(data);
        }
    })
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