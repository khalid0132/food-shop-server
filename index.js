const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require("mongodb").ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()

console.log(process.env.DB_USER)
const port = process.env.PORT || 7200

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2l8hb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log('connection err', err)
  const foodCollection = client.db("buyfood").collection("products");
  const ordersCollection = client.db("buyfood").collection("order1");
  // console.log('database connected successfully');

  // Post foods or products
  app.post('/addFoods', (req, res) => {
    const newEvent = req.body;
    console.log('add', newEvent);
    foodCollection.insertOne(newEvent)
        .then(result => {
            console.log('inserted count', result.insertedCount)
            res.send(result.insertedCount > 0)
        })
})
  //Get all products
  app.get('/foods', (req, res)=>{
    foodCollection.find()
    .toArray((err, items) =>{
      res.send(items)
      console.log('from database', items)
    })
  })

  // Product get
  app.get("/product/:_id", (req, res) => {
    foodCollection
        .find({ _id: ObjectId(req.params._id) })
        .toArray((err, documents) => {
            res.send(documents);
        });
});

// Get orders from Mongo
app.get("/order1", (req, res) => {
  ordersCollection
      .find({ email: req.query.email })
      .toArray((err, items) => {
          res.send(items);
      });
});


   //Delete one product by ID
   app.delete("/deleteProduct/:id", (req, res) => {
    console.log("_id:", req.params.id)

    foodCollection.deleteOne({ _id: ObjectId(req.params._id) })
        .then((result) => {
            console.log(result);
            res.send(result.deletedCount > 0)
        })
})


  //Get Single Product By ID

app.get('/foods/:id', (req, res) => {
  foodCollection
    .find({ _id: ObjectId(req.params.id) })
    .toArray((err, documents) => {
      res.send(documents[0]);
    });
});

  // Create New Order 
   
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

// Insert Product
  app.post('/admin', (req, res)=>{
    const newEvent = req.body;
    console.log('adding new event', newEvent)
    foodCollection.insertOne(newEvent)
    .then(result =>{
      console.log('inserted count', result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  })
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})