const express=require('express');
const router=express.Router();
const DButilsAzure = require('./DButils');
const jwt=require('jsonwebtoken');
const secret = "doubleOSeven";

router.post('/login', (req, res)=>{
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (username === undefined || password === undefined || username === "" || password === "") {
            res.send("Bad request");
            return;
        }
        DButilsAzure.execQuery(
            "select username from users where username='" + req.body.username + "' and pass='" + req.body.password + "'")
            .then(function (result) {
                if (result.length === 0)
                    res.json({
                        message: 'Username is not exist or password is incorrect'
                    });
                else {
                    const payload = {username: req.body.username, password: req.body.password};
                    const options = {expiresIn: "1d"};
                    const token = jwt.sign(payload, secret, options);
                    res.send(token);
                }
            })
            .catch(function (err) {
                console.log(err);
                res.send("Error occurred while login");
            });
    }
    catch (e) {
        console.log(e);
        res.send("Error occurred while login");
    }
});

router.post('/register', (req, res, next)=>{
    const user ={
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email
    };
    DButilsAzure.execQuery(
        "insert into users values('"+
        user.username+"','"+user.password+"','"+
        user.firstName+"','"+user.lastName+"','"+
        user.city+"','"+user.country+"','"+
        user.email+"')")
        .then(function(){
            next();
        })
        .catch(function(err){
            //console.log(err)
            res.send(err)
        });
});

router.post('/register', (req, res, next)=>{
    const categories=req.body.categories;
    console.log(req.body.categories.length);
    categories.forEach(function(category) {
        const categoryName = category.name;
        console.log("**************"+categoryName+"**************");
        DButilsAzure.execQuery(
            "insert into userCategories values('"+
            req.body.username+"','"+categoryName+"')");
        });
    next();
});

router.post('/register', (req, res, next)=>{
    DButilsAzure.execQuery(
        "insert into questionsForUsers values('"+
        req.body.username+"','"+req.body.question1+"','"+
        req.body.answer1+"')");
    next();
});

router.post('/register', (req, res)=>{
    DButilsAzure.execQuery(
        "insert into questionsForUsers values('"+
        req.body.username+"','"+req.body.question2+"','"+
        req.body.answer2+"')");
    res.status(200).json({message: 'register successfully'});
});

router.get('/getMyQuestions/:username', (req, res)=>{
    const username = req.params.username;
    DButilsAzure.execQuery(
        "select id,content " +
        "from questions join questionsForUsers " +
        "on questions.id=questionsForUsers.question " +
        "where [user]='"+username+"';")
        .then(function(result){
            if(result.length!==2)
                res.status(200).send("User does not exists");
            else
                res.status(200).json(result);
        })
        .catch(function(err){
            console.log(err);
            res.send("error while getting the answer");
        });
});

router.post('/restorePassword', (req, res)=>{
    const username = req.body.username;
    const questionID = req.body.questionID;
    const answer = req.body.answer;
    if(username===undefined || username===""
        || questionID===undefined || questionID==="" || questionID<0
        || answer===undefined || answer===""){
        res.send("Bad request");
        return;
    }
    DButilsAzure.execQuery(
        "select pass " +
        "from users join questionsForUsers " +
        "on [user]=username "+
        "where [user]='"+username+"' and question="+questionID+" and answer='"+answer+"';")
        .then(function(result){
            console.log(result.length);
            if(result.length===0)
                res.send("User does not exists or wrong answer");
            else
                res.status(200).json(result);
        })
        .catch(function(err){
            console.log(err);
            res.send("Error occurred while retrieving the password");
        });
});


module.exports = router;




