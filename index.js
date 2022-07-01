const express = require('express')
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const bcrypt = require(('bcrypt'))

const app = express()
const port = process.env.PORT || 5000

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.sq3tb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });





async function run() {
    try {
        await client.connect();
        const billingsCollection = client.db('p-hero').collection('bllings')
        const usersCollection = client.db('p-hero').collection('users')

        app.post('/api/registration', async (req, res) => {
            const query = req.body.email
            const existingUser = await usersCollection.findOne({ email: query })
            if (existingUser) {
                res.send('User Exist')
            }
            else {
                const hashedPass = await bcrypt.hash(req.body.pass, 10)
                const user = { name: req.body.name, email: req.body.email, pass: hashedPass }
                const result = await usersCollection.insertOne(user)

                res.send(result)
            }
        })

        app.post('/api/login', async (req, res) => {
            const query = req.body.email
            const user = await usersCollection.findOne({ email: query })
            console.log(query);
            console.log(user);

            if (user) {
                const matchedUser = await bcrypt.compare(req.body.pass, user.pass)
                if (matchedUser) {
                    res.send("Success")
                }
                else if (!matchedUser) {
                    res.send("Access denied")
                }

            }
            else {
                res.status(400).send('Sorry, we cant find you')
            }
        })


        app.get('/api/billing-list', async (req, res) => {
            const count = await billingsCollection.estimatedDocumentCount()
            const page = parseInt(req.query.page)
            const skip = page * 10
            const search = req.query.query
            if (search) {
                const reverseBlling = await (await billingsCollection.find(
                    {
                        "$or": [
                            { name: { $regex: search, $options: "i" } },
                            { email: { $regex: search, $options: "i" } },
                            { phone: { $regex: search, $options: "i" } }
                        ]
                    }
                ).toArray()).reverse()
                const blling = reverseBlling.splice(skip, 10)
                res.send({ blling, count })
            }
            else if (page >= 0) {
                const reverseBlling = await (await billingsCollection.find().toArray()).reverse()
                const blling = reverseBlling.splice(skip, 10)
                res.send({ blling, count })
            }
            else {
                const blling = await billingsCollection.find().toArray()
                res.send(blling)
            }
        })


        app.post('/api/add-billing', async (req, res) => {
            const newDoc = req.body
            const result = await billingsCollection.insertOne(newDoc)

            res.send(result)

        })

        app.get('/api/update-billing/:id', async (req, res) => {
            const id = req.params.id
            const q = { _id: ObjectId(id) }
            const bill = await billingsCollection.findOne(q)
            res.send(bill)
        })

        app.put('/api/update-billing/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const update = req.body
            const updateDoc = {
                $set: update,
            };

            const result = await billingsCollection.updateOne(filter, updateDoc, options);

            res.send(result)
        })

        app.delete('/api/delete-billing/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: ObjectId(id) }
            const result = await billingsCollection.deleteOne(filter);

            res.send(result)
        })



    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})