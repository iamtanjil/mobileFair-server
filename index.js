const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const port = process.env.Port || 5000;

const app = express();

//middleware

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.ty2hcly.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
        const usersCollection = client.db("mobileFair").collection("users");
        const productsCollection = client.db("mobileFair").collection("products");
        const categorysCollection = client.db("mobileFair").collection("category");
        const bookingsCollection = client.db("mobileFair").collection("bookings");
        const feedbackCollection = client.db("mobileFair").collection("feedback");

        //verify admin
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user.role !== 'admin') {
                return res.status(403).send({ message: 'forbiden access' })
            }
            next();
        };


        //send user data
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


        //get user data
        app.get('/users', async (req, res) => {
            const query = {};
            const result = await usersCollection.find(query).toArray();
            res.send(result)
        });

        //make admin
        app.put('/users/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user.role !== 'admin') {
                return res.status(403).send({ message: 'forbiden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { uspert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        });

        //get admin status
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        });

        //set seller role
        app.put('/seller/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user.role !== 'admin') {
                return res.status(403).send({ message: 'forbiden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { uspert: true };
            const updatedDoc = {
                $set: {
                    role: 'seller'
                }
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        });


        //set seller verification
        app.put('/seller/verification/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user.role !== 'admin') {
                return res.status(403).send({ message: 'forbiden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const option = { uspert: true };
            const updatedDoc = {
                $set: {
                    verifiedSeller: "yes"
                }
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        });

        //get seller status
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' })
        });


        //get seller verification status
        app.get('/users/seller/verification/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isVerified: user?.verifiedSeller === 'yes' })
        });


        //get users status
        app.get('/users/user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({ isUser: user?.role === 'user' })
        });

        //handle deleting user
        app.delete('/manageuser/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        });

        //load all seller data
        app.get('/dashboard/sellers', async (req, res) => {
            const query = { role: 'seller' };
            const result = await usersCollection.find(query).toArray();
            res.send(result);
        });

        //send products data to db
        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products);
            res.send(result);
        });

        // //send seller verification status
        // app.put('/dashboard/seller/verification/:email', async (req, res) => {
        //     const email = req.params.email;
        //     console.log(email);
        //     const filter = { email: email }
        //     const option = { upsert: true }
        //     const updatedDoc = {
        //         $set: {
        //             isVerified: true
        //         }
        //     };

        //     const result = await usersCollection.updateOne(filter, updatedDoc, option);
        //     res.send(result);
        // });

        //get recently added product data
        app.get('/recentlyadded', async (req, res) => {
            const query = {};
            const result = await productsCollection.find(query).limit(4).toArray();
            res.send(result);
        });

        //get category data
        app.get('/category', async (req, res) => {
            const query = {};
            const result = await categorysCollection.find(query).toArray();
            res.send(result);
        });


        //send bookings data to db
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const query = {
                buyerEmail: bookings.buyerEmail
            }
            const alreadyBooked = await bookingsCollection.find(query).toArray();
            if (alreadyBooked.length) {
                const message = `You already book this item`;
                return res.send({ acknowledged: false, message })
            }
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result);
        });


        //get product data by category
        app.get('/products/:category', async (req, res) => {
            const category = req.params.category;
            const query = { brandName: category };
            console.log(query);
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

        //get sellers orders data
        app.get('/dashboard/myorders', async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result)
        });

        //get product data
        app.get('/dashboard/myproduct', async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email };
            const result = await productsCollection.find(query).toArray();
            res.send(result);
        });

        //post feedback data
        app.post('/feedback', async (req, res) => {
            const feedback = req.body;
            const result = await feedbackCollection.insertOne(feedback);
            res.send(result);
        });

        //get feedback data
        app.get('/feedback', async (req, res) => {
            const query = {};
            const result = await feedbackCollection.find(query).toArray();
            res.send(result);
        });

        //get orders data for user
        app.get('/dashboard/orders', async (req, res) => {
            const email = req.query.email;
            const query = { buyerEmail: email };
            const result = await bookingsCollection.find(query).toArray();
            res.send(result);
        });

        //jwt sign
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        });



    }
    finally {

    }

}

run().catch(console.dir)


app.get('/', async (req, res) => {
    res.send('MobileFair Server is Running')
});

app.listen(port, () => {
    console.log(`MobileFair Server is running on port: ${port}`)
});