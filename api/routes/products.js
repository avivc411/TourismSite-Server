const express=require('express');
const router=express.Router();

router.get('/', (req, res, next)=>{
   res.status(200).json({
       message: 'handling get for /products'
   });
});

router.post('/', (req, res, next)=>{
    const product ={
      name: req.body.name,
      price: req.body.price
    };
    res.status(200).json({
        message: 'handling post for /products',
        createProduct: product
    });
});

router.get('/:productid', (req, res, next)=> {
    const id = req.params.productid;
    if(id==="1234") {
        res.status(200).json({
            message: "id is 1234",
            id:id
        });
    }
    else{
        res.status(200).json({
            message: "id is not 1234",
            id:id
        });
    }

});

module.exports = router;