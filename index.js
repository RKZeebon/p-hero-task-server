const express = require('express')
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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


        app.get('/api/billing-list', async (req, res) => {
            const blings = await (await billingsCollection.find().toArray()).reverse()

            res.send(blings)
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
    console.log(`Example app listening on port ${port}`)
})