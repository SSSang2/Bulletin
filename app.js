var express = require('express');
var app = express();
var morgan = require('morgan')
var mysql = require('mysql')
var bodyParser = require('body-parser');

app.use(morgan('short'))
app.use(express.static('./public'))
app.use(bodyParser.urlencoded({extended:false}))

//var userRouter = require('./routers/user.js')

var productRouter = require('./routes/products.js')
//app.use(userRouter)
app.use(productRouter)

app.listen(3000,function(){
	console.log("Server on")
})
