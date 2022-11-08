const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { query } = require('express');
const { ObjectID } = require('bson');
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

// Port 
const port = process.env.PORT || 5000;

// start sever journey

app.get('/', (req, res) => res.send('AmarKitchner Server is running!'))

const uir ="mongodb+srv://mxgangstar310:arifbiswas@cluster0.7xyixxj.mongodb.net"

const client = new MongoClient(uir);

async function run(){
    try {
        const ServicesCollection = client.db("Assignment11").collection("services")
        const ReviewsCollection = client.db("Assignment11").collection("Reviews")

        // Services API 
        app.get("/services" , async(req,res) =>{
            const limited = parseInt(req.query.limited);
            const query ={};

            const cursor = ServicesCollection.find(query)
            if(limited){
                const result = await cursor.limit(limited).toArray();
                res.send(result);
            }
            else{
                const result = await cursor.toArray();
                res.send(result);
            }
            
        })
        app.get("/services/:id" , async(req,res) =>{
            const id = req.params.id;
            const query ={_id : ObjectID(id)};

            const result =await ServicesCollection.findOne(query)
                res.send(result);
        })

        app.post("/services", async(req , res) =>{
            const service = req.body;
            console.log(service);
            const result = await ServicesCollection.insertOne(service);
            res.send(result);
        })

        // Reviews API 
        app.get("/reviews/:id" , async(req,res) =>{
            const id = req.params.id;
            const query ={service_id : id};
            const cursor =  ReviewsCollection.find(query)
            const result = await cursor.toArray();
                res.send(result);
        })

        app.post("/reviews", async(req , res) =>{
            const reviews = req.body;
            console.log(reviews);
            const result = await ReviewsCollection.insertOne(reviews);
            res.send(result);
        })


    } catch (error) {
        console.log(error);
    }
}
run().catch(e => console.log(e));
// Port Listen
app.listen(port, () => console.log(`AmarKitchen app listening on port ${port}!`))