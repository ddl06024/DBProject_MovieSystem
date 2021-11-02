var express = require('express');
var db_config = require('../config/database');
var conn = db_config.init();
var router = express.Router();
var passport = require('../config/passport');

router.get('/:userid', function(req,res){
        var TESTID = req.params.userid;
        console.log(TESTID);
        res.render('users/mypagehome'); 
});

router.get('/movie1/:userid',function(req,res){

        var ID = req.params.userid
        console.log(ID);
        var sql = 'SELECT A.TICKET_NUM, A.SCREEN_DATE, B.PAY_STATE, C.MOVIE_TITLE FROM TICKET_MANAGE A, USER_PAY_HISTORY B, MOVIE_INFO C WHERE A.USER_ID = ? AND A.MOVIE_NUM=C.MOVIE_NUM AND A.TICKET_NUM = B.TICKET_NUM;'; // TICKET_MANAGE로 수정하기
        var params = [ID]
        /* var sql2 = 'SELECT A.TICKET_NUM, A.SCREEN_DATE, B.PAY_STATE, C.MOVIE_TITLE FROM TICKET_MANAGE A, USER_PAY_HISTORY B, MOVIE_INFO C WHERE A.USER_ID = :id AND A.MOVIE_NUM=C.MOVIE_NUM AND A.TICKET_NUM = B.TICKET_NUM;';
        var params2 = {
            id: ID
        } */
        conn.query(sql, params, function(err, results){
            if(err){
                console.log('error : ', err.message);
            }
            else{
                console.log(results);
                res.render( 'movie/movie1',{
               test : results
            });
        }
           // res.render( 'test', { data : data[0] });}
        });
    
   
});

router.get('/snack/:userid',function(req,res){
        var ID = req.params.userid
        var sql = "SELECT * FROM SNACK_PAY_HISTORY WHERE USER_ID =?" ; 
        var params = [ID]
        conn.query(sql, params, function(err, results){
            if(err){
                console.log('error : ', err.message);
            }
            else{
                conn.query
                
                return res.render( 'snack/snack',{
               snacklist : results
            });
        }
    });
});

router.get('/snack1/:snack_pay_num',function(req,res){
    var pay_num = req.params.snack_pay_num;
    var sql = "SELECT * FROM SNACK_PAY_HISTORY WHERE SNACK_PAY_NUM =?" ;
    var params = [pay_num]
    var sql2 = "SELECT SNACK_NAME FROM SNACK_LIST WHERE SNACK_NUM IN (SELECT SNACK_NUM FROM SNACK_LIST_PAY_HISTORY WHERE SNACK_PAY_NUM = ?)"
    conn.query(sql, params, function(err, results){
        if(err){
            console.log('error : ', err.message);
        }
        else{
            conn.query(sql2, params, function(err,results2){
                if(err){
                    console.log('error : ', err.message);
                }
                else{
                    return res.render( 'snack/snack1',{
                        snacklist : results, snackname : results2
                     });
                 }
                })
            }
            
    });
});

router.post('/snack1/:snack_pay_num',function(req,res){    
    var snack_pay_num = req.params.snack_pay_num;
    var params =[snack_pay_num];
    var sql ='UPDATE SNACK_PAY_HISTORY SET PAY_STATE ="결제취소" where SNACK_PAY_NUM = ?'
    conn.query(sql, params, function(err, results){
        if(err){
            console.log('error : ' , err.message);
        }
        else{
            res.redirect('/mypage/snack1/' + req.params.snack_pay_num);
        }
    });
});

router.post('/snack2/:snack_pay_num',function(req,res){    
    var snack_pay_num = req.params.snack_pay_num;
    var params =[snack_pay_num];
    var sql ='UPDATE SNACK_PAY_HISTORY SET SNACK_GET_CHECK ="Y" where SNACK_PAY_NUM = ?'
    conn.query(sql, params, function(err, results){
        if(err){
            console.log('error : ' , err.message);
        }
        else{
            res.redirect('/mypage/snack1/' + req.params.snack_pay_num);
        }
    });
});

router.get('/movie2/:ticket_num',function(req,res){
    var ticket_num = req.params.ticket_num;
    var sql = 'SELECT * FROM USER_PAY_HISTORY WHERE TICKET_NUM =?'
    var sql2 = 'SELECT A.SCREEN_BOX_NAME FROM SCREEN_BOX A WHERE A.SCREEN_BOX_NUM in(SELECT SCREEN_BOX_NUM FROM TICKET_SEAT_LIST WHERE TICKET_NUM = ?)'
    var sql3 = 'SELECT * FROM TICKET_SEAT_LIST WHERE TICKET_NUM = ?'
    var params =[ticket_num];
    conn.query(sql, params, function(err, result1){
        if(err){
           console.log('error : ', err.message);
        }
        else{
            conn.query(sql2, params, function(err,result2){
                if(err){
                    console.log('error : ', err.message);
                }
                else{
                    conn.query(sql3, params, function(err,result3){
                        if(err){
                            console.log('error : ', err.message);
                        }
                        else{
                        res.render( 'movie/movie2', {test : result1, test2 : result2, test3 : result3 });
                        }
                    });
                }
            });
        }

    });
});

router.post('/movie2/:ticket_num',function(req,res){    
    var ticket_num = req.params.ticket_num;
    var params =[ticket_num];
    console.log(ticket_num);
    var sql ='UPDATE USER_PAY_HISTORY SET PAY_STATE ="결제취소" where TICKET_NUM = ?'
    var sql2 = 'UPDATE SEAT_LIST SET SEAT_USE_CHECK ="NY" WHERE SEAT_ROW = (SELECT SEAT_ROW FROM TICKET_SEAT_LIST WHERE TICKET_NUM =?) AND SEAT_COL =(SELECT SEAT_COL FROM TICKET_SEAT_LIST WHERE TICKET_NUM = ?);'
    conn.query(sql, params, function(err, results){
        if(err){
            console.log('error : ' , err.message);
        }
        else{
            res.redirect('/mypage/movie2/' + req.params.ticket_num);
        }
    });
});



module.exports = router;