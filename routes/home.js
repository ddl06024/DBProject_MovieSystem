var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
var db_config = require('../config/database');
var conn = db_config.init();

// home
router.get('/', function(req, res){

    var errors = req.flash('errors') || {};
    // 상영 영화 리스트에서 해당하는 영화 정보 가져오기 
    // 상영 영화 리스트에서 해당하는 영화 사진 가져오기
    var all = 'select * from MOVIE_INFO m where m.MOVIE_NUM in (select MOVIE_NUM from SCREEN_MOVIE_LIST s where m.MOVIE_NUM = s.MOVIE_NUM);'
    var allphoto ='select * from MOVIE_PHOTO m where m.MOVIE_NUM in (select MOVIE_NUM from SCREEN_MOVIE_LIST s where m.MOVIE_NUM = s.MOVIE_NUM);'
    var g10 = "SELECT A.* ,B.GENRE_NAME FROM MOVIE_INFO A, GENRE B WHERE A.MOVIE_NUM IN (SELECT MOVIE_NUM FROM MOVIE_GENRE WHERE GENRE_NUM = 10) and B.GENRE_NUM = 10;";
    var photo10 = 'SELECT * FROM MOVIE_PHOTO WHERE MOVIE_NUM IN (SELECT MOVIE_NUM FROM MOVIE_GENRE WHERE GENRE_NUM = 10);'
    var g1 = "SELECT A.* ,B.GENRE_NAME FROM MOVIE_INFO A, GENRE B WHERE A.MOVIE_NUM IN (SELECT MOVIE_NUM FROM MOVIE_GENRE WHERE GENRE_NUM = 1) and B.GENRE_NUM = 1;";
    var photo1 = 'SELECT * FROM MOVIE_PHOTO WHERE MOVIE_NUM IN (SELECT MOVIE_NUM FROM MOVIE_GENRE WHERE GENRE_NUM = 1);'
    var g3 = "SELECT A.* ,B.GENRE_NAME FROM MOVIE_INFO A, GENRE B WHERE A.MOVIE_NUM IN (SELECT MOVIE_NUM FROM MOVIE_GENRE WHERE GENRE_NUM = 3) and B.GENRE_NUM = 3;";
    var photo3 = 'SELECT * FROM MOVIE_PHOTO WHERE MOVIE_NUM IN (SELECT MOVIE_NUM FROM MOVIE_GENRE WHERE GENRE_NUM = 3);'
  

   
   conn.query(all + allphoto + g10 + photo10 + g1 + photo1 + g3 + photo3, function(err, movies_info){
        if(err) return res.json(err);
        //console.log(results);
     
        return res.render('home/home',{all:movies_info[0],  allphoto:movies_info[1],g10:movies_info[2],  photo10:movies_info[3],g1:movies_info[4],  photo1:movies_info[5],g3:movies_info[6],  photo3:movies_info[7]});
        
    })
    /*conn.query(g10, phto10, function(err, movies_info){
        if(err) return res.json(err);
        //console.log(results);
        conn.query(photo10, function(err, movies_photo){
            if(err) res.json(err);
            return res.render('home/home',{movies_info:movies_info, movies_photo:movies_photo});
        });
    })*/

   
    /* get movie 
    return res.render('home/home', {errors: errors});*/
})

// login page로 render
router.get('/login', function(req, res){
    // error message를 전달하기 위한 error var 선언, error flash message가 존재하면 넣고 없으면 {}
    var errors = req.flash('errors')[0] || {};
    console.log('get');
    console.log(errors);
    //console.log(req.flash('errors')); => error가 난다
    return res.render('home/login',{errors:errors});
});

// post login
router.post('/login', 

    // id 혹은 비밀번호가 입력이 안 된 경우
    function(req,res,next){

        //console.log(req.body);
        var isValid = true;
        var errors ={};
        // username이 input으로 안 들어올 경우
        if(!req.body.username){
            isValid = false;
            errors.username = 'ID를 입력해주세요';
        }
        if(!req.body.password){
            isValid = false;
            errors.password = '비밀번호를 입력해주세요';
        }
        if(isValid){
            next();
        }
        else{
            // login 불가능 상태 -> 다시 redirect login
            //console.log('post');
            //console.log(errors);
            req.flash('errors', errors);
            res.redirect('/login');
        }
    },
    function(req, res, next){
        // local strategy 시작 -> 콜백으로 error, user, info(error.message)
    passport.authenticate('local-login', function(authError, user,info){
        // flash error message
        var errors ={};

        if(authError){
            console.log(authError);
            return next(authError);
        }
        // login 안됨 -> 해당 user가 없음
        if(!user){

            errors.message = info.message;
            console.log(errors.message);
            req.flash('errors', errors);
            return res.redirect('/login');
        }
        // 로그인 성공
        req.logIn(user, function(err){
            if(err) return next(err);
            return res.redirect('/')
        });
        
        })(req, res, next);
        
    }
);

// logout
router.get('/logout', function(req, res){
    req.logout();
    req.session.destroy();
    // main home
    res.redirect('/')
})


module.exports = router;