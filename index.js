const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const port = process.env.Port || 5000;

const app = express();

//middleware

app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://MobileFair:emMkkaMd2GmErvJd@cluster0.ty2hcly.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run () {
    try{
        const usersCollection = client.db("mobileFair").collection("users");


        //send user data
        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log(user)
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


        //get user data


    }
    finally{

    }

}

run().catch(console.dir)


app.get('/', async (req, res) => {
    res.send('MobileFair Server is Running')
});

app.listen(port, () => {
    console.log(`MobileFair Server is running on port: ${port}`)
});