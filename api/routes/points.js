const express=require('express');
const router=express.Router();
const DButilsAzure = require('./DButils');
const jwt=require('jsonwebtoken');
const secret = "doubleOSeven";

router.use('/private', (req, res, next)=>{
    const token = req.header("x-auth-token");
    // no token
    if (!token)
        res.status(401).send("Access denied. No token provided.");
    // verify token
    try {
        req.decoded = jwt.verify(token, secret);
        next();
    } catch (exception) {
        res.status(400).send("Invalid token.");
    }
});

router.get('/getAllPoints', (req, res)=>{
    DButilsAzure.execQuery(
        "SELECT * FROM points")
        .then(function(result){
            res.status(200).json({
                points:result
            });
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});


router.get('/getPoint/:pointName', (req, res)=>{
    const pointName = req.params.pointName;
    DButilsAzure.execQuery(
        "SELECT * FROM points where [name]='"+pointName+"';")
        .then(function(result){
            res.status(200).json({
                points:result
            });
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});

router.post('/private/rankPoint', (req, res, next)=>{
    DButilsAzure.execQuery(
        "SELECT * FROM rankedPoints where [user]='"+req.body.username+"' and point='"+req.body.pointName+"'")
        .then(function(result){
            if(!result.length===0)
                res.status(201).json({
                    message: 'You have already rank this points'
                });
            else next();
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});

router.post('/private/rankPoint', (req, res)=> {
    DButilsAzure.execQuery(
        "insert into rankedPoints values('"+req.body.username+"','"+req.body.pointName+"',"+req.body.rank+")")
        .then(function(){
            res.status(200);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
    res.send('ok');
});

module.exports = router;