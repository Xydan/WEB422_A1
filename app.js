const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
var app = express();
const fs = require('fs');
const ObjectId = require('mongodb').ObjectID;

//restaurant module 
const RestaurantDB = require("./modules/restaurantDB.js");
const { ObjectID } = require('bson');
const db = new RestaurantDB();

//security certificate
const credentials = './X509-cert-4082462911005145335.pem'
//port #
const HTTP_PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(express.static('views'))
app.use(bodyParser.urlencoded({ extended: true }));

//routes
app.post('/api/restaurants', (req, res)=>{
    db.addNewRestaurant(req.body).then((result)=>{
        res.send(result);
    });
});

app.get('/api/restaurants/:id', (req, res)=>{
    if (ObjectId.isValid(req.params.id)){
        db.getRestaurantById(req.params.id).then((result)=>{
            res.send(result);
      });
    } else {
        res.send('Your object ID is incorrect.')
    }
});

app.get('/api/restaurants', (req, res)=>{

        db.getAllRestaurants(req.query.page, req.query.perPage, req.query.borough).then((result)=>{
            res.send(result);
        }).catch((error)=>{
            //error handler 
            console.log(error);
            res.send(error);
        });

});

app.put('/api/restaurants/:id', (req, res)=>{
    if(ObjectID.isValid(req.params.id)){
        db.updateRestaurantById(req.body, req.params.id).then((result)=>{
            res.send(result);
        }).catch((error)=>{
            res.send('Error!');
        });
    }else{
        res.send('Your object ID is incorrect.')
    }
});

app.delete('/api/restaurants/:id', (req, res)=>{
    if(ObjectID.isValid(req.params.id)){
        db.deleteRestaurantById(req.params.id).then((result)=>{
            res.send(result);
        }).catch((error)=>{
            res.send('Error!');
        });
    }else{
        res.send('Your object ID is incorrect.')
    }
});

app.get('/', (req, res)=>{
    res.sendFile('views/index.html', {root: __dirname});
});


db.initialize('mongodb+srv://web422.dz03t.mongodb.net/sample_restaurants?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', credentials).then(()=>{
app.listen(HTTP_PORT, ()=>{
console.log(`server listening on: ${HTTP_PORT}`);
});   
}).catch((err)=>{
console.log(err);
});

