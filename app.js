const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const Moment = require ('moment');
const request = require('request');

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

const CLIENT_ID = 'AQqHYt760mDdrOI2h_sQzLV-qat1aS5AUCpt2-uxm0icWBZUFICVapKMBEL-rY0_aLkhvh6EmUkt9HAF';
const SECRET = 'ECfuE2j7xqpLOcOFQnAJKkiMqJRd7-7iGNgQU6M46CiGyG05Rwzjk_19vl_hDFYCQKt0DlyWWPJUz3zh';
var PAYPAL_API = 'https://api.sandbox.paypal.com';

app.post('/create-payment', (req, res) => {
    var data = {
        auth: {
            user: CLIENT_ID,
            pass: SECRET
        },
        body: {
            intent: 'sale',
            payer: {payment_method: 'paypal'},
            transactions: [{
                amount: {
                    total: '1.99',
                    currency: 'USD'
                }
            }],
            redirect_urls: {
                return_url: 'http://localhost:3000',
                cancel_url: 'http://localhost:3000'
            }
        },
        json: true
    };

    request.post(PAYPAL_API + '/v1/payments/payment', data, function(err, response) {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }
        res.json({
            id: response.body.id
        });
    });
});

app.post('/execute-payment/', function(req, res) {
    var paymentID = req.body.paymentID;
    var payerID = req.body.payerID;

    var data = {
        auth: {
            user: CLIENT_ID,
            pass: SECRET
        },
        body: {
            payer_id: payerID,
            transactions: [
                {
                    amount: {
                        total: '1.99',
                        currency: 'USD'
                    }
                }
            ]
        },
        json: true
    };
    request.post(PAYPAL_API + '/v1/payments/payment/' + paymentID + '/execute', data, function(err, response)
      {
        if (err)
        {
          console.error(err);
          return res.sendStatus(500);
        }
        res.json(
        {
          status: 'success'
        });
      });
});

app.listen(PORT);
