//requirements
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const shortUrl = require('./models/shortUrl');
app.use(bodyParser.json());
app.use(cors());
//requirements

//connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortUrls');

//allow node to find static content
app.use(express.static(__dirname + '/public'));

//create db entry
app.get('/new/:urlToShorten(*)',(req,res,next)=>{
    
    //es5 var urlToShorten = req.params.urlToShorten;
    var {urlToShorten} = req.params;
    //regex for urltoshort
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = expression;
    if(regex.test(urlToShorten)===true){
        var short = Math.floor(Math.random()*100000).toString();

        var data = new shortUrl(
            {
            originalUrl:urlToShorten,
            shorterUrl: short
            }
    );

        data.save(err=>{
            if(err){
                return res.send('Error Saving to database');
                }
            }
            );

        return res.json(data);
    }
    //console.log(urlToShorten);
    var data = new shortUrl({
        orignalUrl: 'urlToShorten does not match standard format',
        shorterUrl: 'InvalidURL'

    });
    return res.json({data});
});
//query db and forward to orignal url
app.get('/:urlToForward', (req,res,next)=>{
    //store value in shorter url
    var shorterUrl = req.params.urlToForward;

    shortUrl.findOne({'shorterUrl':shorterUrl},(err,data)=>{
        if(err)return res.send("Error reading mongo db");
        var re = new RegExp("^(http|https)://","i");
        var strToCheck = data.orignalUrl;
        if (re.test(strToCheck)){
            res.redirect(301,data.orignalUrl);
        }
        else{
            res.redirect(301,'http://'+data.originalUrl);
        }
    });
});


//listen
//es5 function(){}
//process if on heroku
app.listen(process.env.PORT || 3000,()=>{
console.log("Its Working!");
});