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


// categories ****
router.post('/register', (req, res, next)=>{
    const categories=req.body.categories;
    if (categories===undefined || categories.length<2)
        res.send("Bad request");
    let validationCheck = true;
    categories.forEach(function(category) {
        if(category===undefined || category.name===undefined || category.name==="")
            validationCheck=false;
        else {
            categories.forEach(function (category2) {
                if (category2.name !== undefined && category.name === category2.name && category !== category2)
                    validationCheck = false;
            });
        }
    });
    if(!validationCheck)
        res.send("Bad request - Categories");
    categories.forEach(function(category) {
            DButilsAzure.execQuery(
                "SELECT * " +
                "FROM categories " +
                "WHERE [name]='"+category.name+"'")
                .then(function(result){
                    if(result.length===0)
                        validationCheck=false;
                })
                .catch(function(){
                    validationCheck=false;
                });
        }
    );
    if(!validationCheck)
        res.send("Bad request - Categories");
    else next();
});




//null checking for questions and answers
router.post('/register', (req, res, next)=> {
    if (req.body.question1===undefined || req.body.answer1=== undefined || req.body.question2===undefined || req.body.answer2===undefined)
        res.send(' error - check your questions and answers');
    else
        next();
});

//checking if user insert 2 different questions
router.post('/register', (req, res, next)=> {
    if (req.body.question1===req.body.question2)
        res.send(' error - you need to insert different questions');
    else
        next();
});

// checking question1
router.post('/register', (req, res, next)=>{
    DButilsAzure.execQuery(
        "select * from questions where [id]='"+req.body.question1+"'")
        .then(function(result){
            if(result.length!==1)
                res.status(200).send("question1 does not exists");
            else
                next();
        })
        .catch(function(err){
            console.log(err);
            res.send("error while getting the question");
        });
});

// checking question2
router.post('/register', (req, res, next)=>{
    DButilsAzure.execQuery(
        "select * from questions where [id]='"+req.body.question2+"'")
        .then(function(result){
            if(result.length!==1)
                res.status(200).send("question2 does not exists");
            else
                next();
        })
        .catch(function(err){
            console.log(err);
            res.send("error while getting the question");
        });
});




router.post('/register', (req, res, next)=> {
    const user = {
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email
    };
    var fields=true;
    // null checking
    if (user.username==undefined || user.password== undefined ||
        user.firstName==undefined || user.lastName== undefined||
        user.city==undefined || user.country== undefined || user.email==undefined ||
        user.username.length<1 || user.password.length<1  ||
        user.firstName.length<1  || user.lastName.length<1 ||
        user.city.length<1  || user.country.length<1  || user.email.length<1 ){
        res.send("not all fields exists");
        fields=false;
        return;
    }
    var legalUserName=true;
    // user name checking
    if (user.username.length<3 || user.username>8){
        res.send("user name length illegal");
        llegalUserName=false;
        return;
    }
    if (legalUserName==true) {
        for (var i = 0; i < user.username.length; i++) {
            if (((user.username[i] >= 'a' && user.username[i] <= 'z') || (user.username[i] >= 'A' && user.username[i] <= 'Z')))
                continue;
            else {
                res.send('illegal username');
                legalUserName=false;
                break;
            }
        }
    }
    var legalPass=true;
    // password checking
    if (user.password.length < 4 || user.password.length > 10) {
        res.send("invalid password - password must be between 5 to 10 notes");
        legalPass=false;
        return;
    }
    if (legalPass==true) {
        for (var i = 0; i < user.password.length; i++) {
            if (((user.password[i] >= 'a' && user.password[i] <= 'z') || (user.password[i] >= 'A' && user.password[i] <= 'Z'))
                || user.password[i] == '0' || user.password[i] == '1' || user.password[i] == '2' || user.password[i] == '3'
                || user.password[i] == '4' || user.password[i] == '5' || user.password[i] == '6'
                || user.password[i] == '7' || user.password[i] == '8' || user.password[i] == '9')
                continue;
            else {
                res.send('illegal password');
                legalPass=false;
                break;
            }
        }
    }
    var legalCountry=true;
    // country checking
    DButilsAzure.execQuery(
        "select * " +
        "from countries " +
        "where [countryName]='" + user.country + "';")
        .then(function (result) {
            console.log("country check");
            console.log(result.length);
            if (result.length === 0) {
                res.status(200).send("Country doesnt exists");
                legalCountry=false;
                return;
            }
        });
    var legalNewUser=true;
    // user already exists checking
    DButilsAzure.execQuery(
        "select * from users where [username]='"+user.username+"'")
        .then(function (result) {
            console.log("user check");
            console.log(result.length);
            if (result.length !=0) {
                res.status(200).send("user Already exists");
                legalNewUser=false;
                return;
            }
        })
        .catch(function (err) {
            //console.log(err)
            res.send(err);
        });


if (legalCountry===true && legalNewUser===true && legalPass===true && legalUserName===true
    && fields===true) {
    DButilsAzure.execQuery(
        "insert into users values('" +
        user.username + "','" + user.password + "','" +
        user.firstName + "','" + user.lastName + "','" +
        user.city + "','" + user.country + "','" +
        user.email + "')")
        .then(function () {
        })
        .catch(function (err) {
            //console.log(err)
            res.send(err);
        });
}
    if (legalCountry===true && legalNewUser===true && legalPass===true && legalUserName===true
        && fields===true) {
        next();
    }
});


router.post('/register', (req, res, next)=>{
    const categories=req.body.categories;
    categories.forEach(function(category) {
        const categoryName = category.name;
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
                res.status(200).json({
                    message: 'questions:',
                    result: result
                });
        })
        .catch(function(err){
            console.log(err);
            res.send("error while getting the questions");
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




