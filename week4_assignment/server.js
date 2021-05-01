//importing libraries required for server hosting
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const thenRequest = require('then-request');
//creating an instance for express
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('public'));
//MongoDB
let MongoClient = require('mongodb').MongoClient;
async function createConnection(){
    let connectionUrl = "mongodb://localhost:27017/"
    let db = await MongoClient.connect(connectionUrl,{ useUnifiedTopology: true });
    let dbo = db.db('name')
    return Promise.resolve(dbo);
}
app.get('/', (req,res)=>{
    res.sendFile(__dirname+"/index.html")
})

app.get('/getDetails' , (req,res)=>{

    async function main(){
        let connection = await createConnection();
        let finder = await connection.collection("user").find({}).toArray();
        res.send(finder)
        // connection.collection("user").insertOne(details)
        // console.log(details)
        // res.send(true)
    }

    main()

})
// GET home-page
app.get("/Insert",(req,res)=>{
    res.sendFile(__dirname+'/Insert.html')
})

app.get("/Show",(req,res)=>{
    res.sendFile(__dirname+"/show.html")         
})
app.get("/delete",(req,res)=>{
    res.sendFile(__dirname +"/delete.html")
})

app.get("/ShowData",(req,res)=>{
    async function main(){
        let connection = await createConnection();
        let finder = await connection.collection("user").find({}).toArray();
        res.send(finder)
    }
    main()
})

app.post("/Delete",(req,res)=>{
    async function main(){
        let roll = req.body.rollno
        let connection = await createConnection();
        //let finder = await connection.collection("user").find({"roll":roll}).toArray();
        //if(finder.length>0){
        let v = await connection.collection("user").deleteOne({"roll":roll});
        if(v.deletedCount>0){
           res.send({'status':"user has been deleted"})
        }
        else{
           res.send({'status':'user does not exist'})
        }
        
    }
    main()
} )

app.post('/Insert' , (req,res)=>{

    async function main(){
        let details = req.body
        let connection = await createConnection();

        let finder = await connection.collection("user").find({"email":req.body.email , 'mob_no':req.body.mob_no}).toArray();
        if (finder.length > 0){
            res.send({"status":"user already exists"})
        }
        else{
            connection.collection("user").insertOne(details)
            res.send({"status":"user added successfully"})
        }
    }
    main()
})

app.post('/connectorAssistant', (req, res) => {
    console.log(req.body)
    url = 'https://1466703ce841.ngrok.io'
    async function main() {
    if (req.body.queryResult.intent.displayName == "getAllStudents") {
        let response = await thenRequest('GET', url+'/getDetails')
        let responseFinal = ""
        for (i of JSON.parse(response.body)) {
            responseFinal = responseFinal + i.name + " ,"
            }
        res.send({ 'fulfillmentText': responseFinal })
    }
    
    else if (req.body.queryResult.intent.displayName == "deleteUser") {
        let rollNumber = req.body.queryResult.parameters.roll.toString();
        let response = await thenRequest('POST', url + '/Delete', { json: { "rollno": rollNumber } })
        response = JSON.parse(response.body)
        res.send({ 'fulfillmentText': response.status })
    }
    else if (req.body.queryResult.intent.displayName == "addUser") {
        let params = req.body.queryResult.parameters
        let response = await thenRequest('POST', url+'/Insert', { json: params })
        response = JSON.parse(response.body)
        res.send({ 'fulfillmentText': response.status })
    }
    else if (req.body.queryResult.intent.displayName == "ShowGraph") {
        let c = req.body.queryResult.parameters.class
        let d = req.body.queryResult.parameters.division
        let response = await thenRequest('GET', url +'/getDetails')
        let final_response=""
        for(i of JSON.parse(response.body)){
            if (i.classroom == c){
                if (i.division ==d){
                    final_response = final_response + ' Roll number: '+ i.roll + ' Name: ' + i.name + ' Attendance: '+ i.attendance  
                }
            }
        }
        res.send({'fulfillmentText': final_response})
    }
    else {
        res.send({ 'fulfillmentText': "go to hell" })
    }
    }
    main()
    })

app.listen(8086)
console.log('server has started')