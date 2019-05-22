
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

router.get('/getCategories', (req, res, next)=>{
    DButilsAzure.execQuery(
        "SELECT * FROM categories")
        .then(function(result){
            res.status(200).json({
                message: 'got from db',
                result: result
            });
            res.send(result)
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});



router.get('/getAllInCategory/:category', (req, res)=>{
    const category = req.params.category;
    DButilsAzure.execQuery(
        "select * from categories join points on categories.[name]=points.[category] where categories.[name]='"+category+"';")
        .then(function(result){
            res.status(200).json({
                category:result
            });
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});



module.exports = router;