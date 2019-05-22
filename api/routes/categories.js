
const express=require('express');
const router=express.Router();
const DButilsAzure = require('./DButils');

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