const express=require('express');
const router=express.Router();
const DButilsAzure = require('./DButils');

router.get('/readUsers', (req, res, next)=>{
    DButilsAzure.execQuery(
        "SELECT * FROM users")
        .then(function(result){
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
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
            console.log(err)
            res.send(err)
        });
});

router.post('/register', (req, res, next)=>{
    const categories=req.body.categories;
    categories.forEach(function(category) {
        const categoryName = category.name;
        console.log("**************"+categoryName+"**************");
        DButilsAzure.execQuery(
            "insert into userCategories values('"+
            req.body.username+"','"+categoryName+"')");
        });
    next();
});

router.post('/register', (req, res)=>{
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
        "select content " +
        "from questions join questionsForUsers " +
        "on questions.id=questionsForUsers.question " +
        "where [user]='"+username+"';")
        .then(function(result){
            res.status(200).json(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        });
});

router.post('/restorePassword', (req, res)=>{
    const username = req.body.username;
    const answer = req.body.answer;
    DButilsAzure.execQuery(
        "select pass " +
        "from users join questionsForUsers " +
        "on [user]=username "+
        "where [user]='"+username+"' and answer='"+answer+"';")
        .then(function(result){
            res.status(200).json(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err)
        });
});


module.exports = router;




