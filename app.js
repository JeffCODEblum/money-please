const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const Moment = require ('moment');

mongoose.connect('mongodb://localhost/money-please', {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

const ItemSchema = new mongoose.Schema({name: String, ammount: Number, timestamp: Number});
const ItemModel = new mongoose.model('ItemModel', ItemSchema);

app.use(express.static('public'))
app.use(bodyParser.json());

const PORT = 3000;
const APP_URL = 'http://localhost:' + PORT;

app.post('/transaction', (req, res) => {
    const ammount = req.body.ammount;
    const itemModel = new ItemModel({name: 'test', ammount: ammount, timestamp: Date.now()});
    itemModel.save((doc, err) => {
        if (err) {
            console.log(err);
        }
        if (doc) {
            console.log("$" + ammount + "   " + doc.timestamp);
            res.send(true);
        }
    });
});

app.listen(PORT);
