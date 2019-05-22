const express=require('express');
const router=express.Router();
const DButilsAzure = require('./DButils');

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


module.exports = router;