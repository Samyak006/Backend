const express = require('express');
const bodyParser = require('body-parser');


//app
const app = express()

app.use(express.json())
var response={};
var entries =[{name:'asdfasdf',email:'email@example.com',mobile_number:12233445,dob:13-13-13,address:'qwerqwerqwer'}]
var flag=0;
//GET-method
app.get('/login', (req,res) =>{
    response={
        name:req.query.name,
        email:req.query.email,
        mobile_number:req.query.mobile_number,
        dob:req.query.dob,
        address:req.query.address
    }
    for(data in entries){
        if(entries[data].name == response.name && entries[data].email == response.email && entries[data].mobile_number==response.mobile_number && entries[data].dob==response.dob && entries[data].address == response.address){
            res.sendFile(__dirname+'/session.html');
            flag = 1;
        }
    }
    if(flag==0){
        entries.push(response);
        res.sendFile(__dirname+'/success.html')
    }
    flag=0;
    response={};
    console.log(req.query)
})
//POST-method

app.get('/',(req,res)=>{
    res.sendFile(__dirname +'/index.html')
})

app.listen(8086)
console.log('server has started')