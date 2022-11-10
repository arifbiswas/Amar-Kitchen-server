const express = require('express')
const app = express()
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// middleware
app.use(cors());
app.use(express.json());

// Port 
const port = process.env.PORT || 5000;

// start sever journey

app.get('/', (req, res) => res.send('AmarKitchner Server is running!'))

const uir = process.env.DB_URI;

const client = new MongoClient(uir);

    function verifyToken(req , res ,next){
        const authTokenGetHeader = req.headers.authorization;
        if(!authTokenGetHeader){
            res.status(401).send({message : "Unauthorized access"})
        }
        jwt.verify(authTokenGetHeader, process.env.SECRET_AUTH_TOKEN, function(error,decoded){
            if(error){
                res.status(401).send({message : "Forbidden Access"})
            }
            req.decoded = decoded;
            next()
        })
    }

async function run(){
    try {
        const ServicesCollection = client.db("Assignment11").collection("services")
        const ReviewsCollection = client.db("Assignment11").collection("Reviews")

        // json web token create 
        app.post("/jwt", (req,res)=>{
            const user = req.body;
            const token = jwt.sign(user,process.env.SECRET_AUTH_TOKEN);
            res.send({token});
        })

        // Services API 
        app.get("/services", async(req,res) =>{
            const limited = parseInt(req.query.limited);
            const perPage = parseInt(req.query.perPage);
            const size = parseInt(req.query.size);
            console.log(perPage,size);
            const query ={};

            const cursor = ServicesCollection.find(query)
            if(perPage || size){
                const services = await cursor.skip(perPage * size).limit(size).toArray();
                const count = await ServicesCollection.estimatedDocumentCount();
               res.send({services , count });
            }
            if(limited){
              
               const services = await cursor.limit(limited).toArray();
               res.send(services);
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

        

        //  Id get Review    
        app.get("/reviews/:id" , async(req,res) =>{
            const id = req.params.id;
            let query = {_id : ObjectID(id)};
                    const result =await  ReviewsCollection.findOne(query)
                    res.send(result);
        })

        // All reviews 
        app.get("/reviews" , async(req,res) =>{
            try {
                let query ={};
            const service_id =req.query;
            console.log(service_id);
            if(service_id){
                query = {...service_id}
                const cursor =  ReviewsCollection.find(query)
                const result = await cursor.toArray();
                res.send(result);
            }
           else{
            const cursor = ReviewsCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
           }
            } catch (error) {
                console.log(error);
            }
        })

        app.get("/reviews", verifyToken , async(req,res) =>{
            const decoded = req.decoded;
            const email = req.query;
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }
            console.log(email);
            if(email){
                const query ={...email};
                const cursor = ReviewsCollection.find(query)
                const result = await cursor.toArray();
                res.send(result);
            }
            else{
                res.send({
                    status : "email not fund"
                });
            }
        })
        
        app.post("/reviews", async(req , res) =>{
            const reviews = req.body;
            console.log(reviews);
            const result = await ReviewsCollection.insertOne(reviews);
            res.send(result);
        })
        // PATCH REVIEWS 
        app.patch("/reviews/:id", async(req , res) =>{
            const id = req.params.id;
            const updateReview = req.body;
            const query = {_id : ObjectID(id)}
            const result = await ReviewsCollection.updateOne(query,{$set:{
                star : updateReview.star,
                userReview : updateReview.userReview
            }});
            res.send(result);
        })
        app.delete("/reviews/:id", async(req , res) =>{
            const id = req.params.id;
            const query = {_id : ObjectID(id)}
            const result = await ReviewsCollection.deleteOne(query);
            res.send(result);
        })


    } catch (error) {
        console.log(error);
    }
}
run().catch(e => console.log(e));
// Port Listen
app.listen(port, () => console.log(`AmarKitchen app listening on port ${port}!`))