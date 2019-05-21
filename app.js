const express =  require("express");
const app = express();
const bodyParser = require('body-parser');
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const usersRoutes = require('./api/routes/users');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', usersRoutes);


app.use((req, res, next)=>{
   const error = new Error('not found');
   error.status = 404;
   next(error);
});

app.use((error, req, res, next)=>{
   res.status(error.status || 500);
   res.json({
      error: {message: error.message}
   });
});

module.exports = app;