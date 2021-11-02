var express = require('express');
var methodOverride = require('method-override');
// for db connection
var db_config = require(__dirname+'/config/database');
var conn = db_config.init();
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var app = express();
// db_connection
db_config.connect(conn);

// other setting
app.use(express.json())
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public')); // public -> ejs
app.use(express.urlencoded({extended:true}));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));

// Passport setting
app.use(passport.initialize());
app.use(passport.session());

/*debugging
conn.query('select * from USER_LIST', function(err, result, field){
  if(err) return res.json(err)
  console.log(result);
  // => object
  console.log(typeof(result)); 
  //console.log(field);
})
*/

//로그인 시 사용되는 Middlewares
app.use(function(req,res, next){

  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
  
});

//Routes
app.use('/', require('./routes/home'));
app.use('/users', require('./routes/users'));
app.use('/reservation', require('./routes/reservation'));
app.use('/mypage', require('./routes/mypage'));
app.use('/snack', require('./routes/snack'));
app.use('/reserve_seat', require('./routes/reservation'));
app.use('/reservation2', require('./routes/reservation2'));
app.use('/movie', require('./routes/movie'));
// Port setting
var port = 1000;
app.listen(port,function(){
  console.log('server on http://localhost:' + port);
})
