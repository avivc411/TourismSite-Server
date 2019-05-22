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


router.get('/getPoint/:pointname', (req, res)=>{
    const pointName = req.params.pointname;
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











module.exports = router;