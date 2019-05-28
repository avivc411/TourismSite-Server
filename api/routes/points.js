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
            DButilsAzure.execQuery(
                "update points "+
                        "set numOfViewers=numOfViewers+1 "+
                        "where [name]='"+pointName+"';"
            ).then(function(){
                res.status(200).json({
                    points: result
                })
            });
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});

router.get('/getLastTwoReviews/:pointName', (req, res)=>{
    const pointName = req.params.pointName;
    DButilsAzure.execQuery(
        "select top 2 * from reviews join points on reviews.[point]=points.[name] where reviews.[point]='"+pointName+"'order by [date] desc;")
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
        "SELECT * " +
        "FROM rankedPoints " +
        "where [user]='"+req.decoded.username+"' and point='"+req.body.pointName+"'")
        .then(function(result){
            if(!(result.length===0))
                res.status(201).json({
                    message: 'You have already ranked this points'
                });
            else next();
        })
        .catch(function(err){
            console.log(err);
            res.send("Error occurred while checking if the user ranked this point");
        });
});

router.post('/private/rankPoint', (req, res, next)=> {
    DButilsAzure.execQuery(
        "insert into rankedPoints values('"+req.decoded.username+"','"+req.body.pointName+"',"+req.body.rank+")")
        .then(function(){
            next();
        })
        .catch(function(err){
            console.log(err);
            res.send("Error occurred while ranking the point");
        });
});

router.post('/private/rankPoint', (req, res)=> {
    DButilsAzure.execQuery(
        "update points " +
        "set [rank]=av " +
        "from " +
        " (select avg(cast([rank] as decimal(10,2) ) ) /5*100 as av " +
        " from rankedPoints " +
        " where point='"+ req.body.pointName +"') as T " +
        "where [name]='"+ req.body.pointName +"'"
    )
        .then(function(){
            res.status(200).send('ok');
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});

router.post('/private/writeReviewOnPoint', (req, res, next)=>{
    DButilsAzure.execQuery(
        "SELECT * FROM reviews where [user]='"+req.decoded.username+"' and point='"+req.body.pointName+"'")
        .then(function(result){
            if(!result.length===0)
                res.status(201).json({
                    message: 'You have already reviewed this points'
                });
            else next(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});

router.post('/private/writeReviewOnPoint', (result, req, res)=> {
    console.log(result);
    DButilsAzure.execQuery(
        "insert into reviews values('"+req.decoded.username+"','"+req.body.pointName+"','"+req.body.review+"', GETDATE())")
        .then(function(){
            res.status(200).send('ok review inserted');
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});

router.get('/private/getLastTwoPoints', (req, res)=>{
    DButilsAzure.execQuery(
        "select top 2 * "+
        "from savedPoints join users "+
        "on username=[user] "+
        "where [user]='"+req.decoded.username+"' "+
        "order by [savedDate] desc;")
        .then(function(result){
            res.status(200).send(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});

router.get('/private/getFavoritesPoints', (req, res)=>{
    DButilsAzure.execQuery(
        "select [name],[desc],[rank],[numOfViewers],[category] "+
        "from savedPoints join points "+
        "on point=[name] "+
        "where [user]='"+req.decoded.username+"'")
        .then(function(result){
            res.status(200).send(result);
        })
        .catch(function(err){
            console.log(err);
            res.send(err);
        });
});

router.put('/private/addPointsToFavorites', (req, res)=>{
   const points=req.body.points;
   points.forEach((point)=>{
       DButilsAzure.execQuery(
           "IF EXISTS (SELECT * " +
                            "FROM savedPoints " +
                            "WHERE point='"+point.name+"') " +
           "UPDATE savedPoints " +
           "SET internalRank="+point.internalRank+" " +
           "WHERE [point]='"+point.name+"' and [user]='"+
                req.decoded.username+"' " +
           "ELSE " +
           "INSERT INTO savedPoints VALUES ('"+req.decoded.username+"','"+point.name+"',GETDATE(),"+point.internalRank+")"
       )
       .then(function(){
           res.status(200).send('done');
       })
       .catch(function(err){
           console.log(err);
           res.send(err);
       });
    })
});





















module.exports = router;