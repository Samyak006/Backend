const express = require('express');
const app  = express();
var urlencodedParser = express.urlencoded({extended:false})
app.use(express.json())
app.use(express.static('public'));
app.set('view engine','ejs')
let MongoClient = require('mongodb').MongoClient;

// GET for all pages
app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.get('/about_us',(req,res)=>{
    res.render('about_us');
});

app.get('/FAQs',(req,res)=>{
    res.render('FAQs');
});

app.get('/feedback',(req,res)=>{
    res.render('feedback');
});

app.get("/register",(req,res)=>{
    res.render('register');
})

// creating connection with database
async function createUserConnection(){
    let connectionUrl = "mongodb://localhost:27017/"
    let db = await MongoClient.connect(connectionUrl,{ useUnifiedTopology: true });
    let dbo = db.db('CoSahayak')
    return Promise.resolve(dbo);
}

// interaction with database and algorithms 
app.post('/register',(req,res)=>{
    async function main(){
        let details = req.body;
        let connection  = await createUserConnection();
        let finder = await connection.collection('register').find({'name':req.body.name}).toArray();
        if (finder.length > 0){
            res.send({"status":"user already exists"})
        }
        else{
            connection.collection("register").insertOne(details)
            connection.collection("login").insertOne({'username':req.body.name,'password': '12345'})
            connection.collection("show").insertOne({'username':req.body.name,'state':req.body.state,'district':req.body.district,'pincode':req.body.pincode,"contact_number":req.body.telephone,'address':req.body.address,'organization':req.body.TypeOfOrganisation,"bloodAp":"","bloodAm":"","bloodBp":"","bloodBm":"","bloodABp":"","bloodABm":"","bloodOp":"","bloodOm":"","plasmaAp":"","plasmaAm":"","plasmaBp":"","plasmaBm":"","plasmaABp":"","plasmaABm":"","plasmaOp":"","plasmaOm":"","Oxygen":"","remedesvir":"","heparin":"",'AcceptanceStatus_blood':"","AcceptanceStatus_plasma":""})
            connection.collection('specific').insertOne({"username":details.name,"bloodAp":"","bloodAm":"","bloodBp":"","bloodBm":"","bloodABp":"","bloodABm":"","bloodOp":"","bloodOm":"","plasmaAp":"","plasmaAm":"","plasmaBp":"","plasmaBm":"","plasmaABp":"","plasmaABm":"","plasmaOp":"","plasmaOm":"","Oxygen":"","remedesvir":"","heparin":"",'AcceptanceStatus_blood':"","AcceptanceStatus_plasma":""})
            res.send({"status":"user added sucessfully"})
        }
    }
    main()
})

app.post("/login",urlencodedParser,(req,res)=>{
    async function main(){
        let details = req.body;
        let connection = await createUserConnection();
        let finder = await connection.collection("login").find({"username":req.body.username , "password":req.body.password}).toArray();
        if (finder.length>0){
            let jinder = await connection.collection("specific").find({ "username": details.username}).toArray();
            if(jinder.length>0){
                res.render('fill_details',jinder[0])
            }
            else {
                res.send({status: 404})    
            }
        }
        else{
            res.send({"status":"Invalid login credentials"})
        }
    }
    main()
})

const omit = (obj, arr) =>
  Object.keys(obj)
    .filter(k => !arr.includes(k))
    .reduce((acc, key) => ((acc[key] = obj[key]), acc), {});

app.post("/fill_details",urlencodedParser,(req,res)=>{
    async function main(){
        let details = req.body;
        let omitQuery=[];
        for( i in details){
            if(details[i] == null || details[i] == undefined || details[i] == ""){
                omitQuery.push(i)
            }
        }
        let connection = await createUserConnection();
        connection.collection('specific').updateOne({"username":req.body.username},{$set:omit(details,omitQuery)},function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
          });
        connection.collection("show").updateOne({'username':req.body.username},{$set:omit(details,omitQuery)})
        res.send({"status":"updated successfully"})
    }
    main()
})

app.get("/show",(req,res)=>{
    async function main(){
    let connection = await createUserConnection();
    let finder = await connection.collection("show").find({}).toArray();
    res.send(finder)
    }
    main()
})

app.get("/blood",(req,res)=>{
    res.render("blood");
})

app.get("/plasma",(req,res)=>{
    res.render("plasma");
})

app.get("/medicine",(req,res)=>{
    res.render("medicine");
})

app.get("/oxygen",(req,res)=>{
    res.render("oxygen");
})


//hosting the server on port 3000
app.listen(3000)
console.log('server has started')