const express=require('express');
const router=express.Router();

router.get('/', (req, res, next)=>{
    res.status(200).json({
        message: 'handling get for orders'
    });
});

router.post('/', (req, res, next)=>{
    res.status(201).json({
        message: 'handling post for orders'
    });
});

module.exports = router;