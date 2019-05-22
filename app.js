const express =  require("express");
const app = express();
const bodyParser = require('body-parser');
const usersRoutes = require('./api/routes/users');
const pointsRoutes = require('./api/routes/points');
const jwt=require('jsonwebtoken');
const secret = "doubleOSeven";

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.post('/login', (req, res)=>{
   const payload = {username: req.body.username, password: req.body.password};
   const options = {expiresIn: "1d"};
   const token=jwt.sign(payload, secret, options);
   res.send(token);
});

app.use('/private', (req, res, next)=>{
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

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', usersRoutes);
app.use('/points', pointsRoutes);


app.use((req, res, next)=>{
   const error = new Error('not found');
   error.status = 404;
   next(error);
});

app.use((error, req, res)=>{
   res.status(error.status || 500);
   res.json({
      error: {message: error.message}
   });
});

module.exports = app;