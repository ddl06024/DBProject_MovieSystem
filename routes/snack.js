const { request } = require('express');
var express = require('express');
var db_config = require('../config/database');
var conn = db_config.init();
var router = express.Router();
var passport = require('../config/passport');
var Middlewares = require('../middleware');
const { all } = require('./home');
require("date-utils");

// 스낵 구매 페이지 
router.get('/:userid',Middlewares.isLoggined, function(req,res){

    // 콤보, 팝콘, 음료, 스낵 데이터 불러옴 
    var combo = 'SELECT * FROM SNACK_LIST where TYPE = "콤보";';
    var con = 'SELECT * FROM SNACK_LIST where TYPE = "팝콘";';
    var beverage = 'SELECT * FROM SNACK_LIST where TYPE = "음료";';
    var snack = 'SELECT * FROM SNACK_LIST where TYPE = "스낵";';
    conn.query(combo + con + beverage + snack,function(err, results){
        if(err){
            console.log('error : ', err.message);
        }
        else{
            res.render('users/snacklist', { combo_result : results[0],con_result : results[1],beverage_result: results[2],snack_result : results[3]  });
         }
    });
});

//  스낵 장바구니에 넣기 
router.post('/:userid', Middlewares.isLoggined, function(req,res){   

    var userid= req.params.userid; // 유저 아이디 
    console.log(req.body);
    var snack_num = req.body.snack_num; // 스낵 번호 
    var count = req.body.num; // 스낵 수량 
    var price = req.body.snack_price; // 스낵 1개 가격
    var allprice = count * price // 스낵 총 가격 
    var params = [userid, snack_num, count,allprice];
 
    // 스낵 장바구니에 넣기 
    var sql = "INSERT INTO SNACK_TEST VALUE (?,?,?,?)";

    // 만약 같은 게 장바구니에 있으면 수량 업데이트
    var sql2 = "UPDATE SNACK_TEST SET SNACK_COUNT =? , SNACK_PRICE = ? WHERE SNACK_NUM = ?"
    var params2 = [count, allprice,snack_num];

    conn.query(sql, params, function(err, results){
        if(err){
            conn.query(sql2, params2, function(err, results){
                if(err){
                    console.log('error : ' , err.message);
                }
                else{
                    res.redirect('/snack/' + req.params.userid);
                }
            });
        }
        else{
            // 스낵 페이지
            res.redirect('/snack/' + req.params.userid);
        }
    });
   
});

// 스낵 장바구니 페이지 
router.get('/snack_bag/:userid', Middlewares.isLoggined,  function(req,res){

    var userid= req.params.userid;

    // 스낵 장바구니 목록 불러오기 
    var sql = "SELECT * FROM SNACK_TEST WHERE USER_ID = ?"

    // 스낵 정보 불러오기 
    var sql2 = "SELECT * FROM SNACK_LIST WHERE SNACK_NUM IN (SELECT SNACK_NUM FROM SNACK_TEST WHERE USER_ID = ?) "
    
    // 스낵 총 가격 
    var sql3 = "SELECT sum(SNACK_PRICE) as A from SNACK_TEST WHERE USER_ID =?";
    params = [userid];
    conn.query(sql, params, function(err, results1){
        if(err){
            console.log('error : ', err.message);
        }
        else{
            conn.query(sql2, params, function(err, results2){
            if(err){
                console.log('error : ', err.message);
            }
            else{
                conn.query(sql3, params, function(err, results3){
                    if(err){
                        console.log('error : ', err.message);
                    }
                    else{
                    res.render('snack/snack_bag', { test1 : results1, test2 : results2, test3:results3});
                    }
                })
            }
        })
    }
 });
});

// 스낵 결제 페이지 
router.get('/snack_pay/:userid', Middlewares.isLoggined, function(req,res){
    
    var userid= req.params.userid;

    // snack test: 스낵 장바구니에서 가져옴 
    var sql = "SELECT * FROM SNACK_TEST WHERE USER_ID = ?"

    // 스낵 정보 불러오기 
    var sql2 = "SELECT * FROM SNACK_LIST WHERE SNACK_NUM IN (SELECT SNACK_NUM FROM SNACK_TEST WHERE USER_ID = ?) "
    
    // 스낵 총 가격 
    var sql3 = "SELECT sum(SNACK_PRICE) as A from SNACK_TEST WHERE USER_ID =?";
    params = [userid];
    
    // 사용자의 잔여 포인트 가져오기 => 가장 최근의 날짜 data 가져오기 
    var point_query = "select *from POINT_MANAGE where POINT_USE_DATE=(select MAX(POINT_USE_DATE)FROM POINT_MANAGE where USER_ID=?)";

    conn.query(point_query, req.params.userid, function(err, point){

        if(err) return res.json(err);
        console.log(point);

        conn.query(sql, params, function(err, results1){
            if(err){
                console.log('error : ', err.message);
            }
            else{
                conn.query(sql2, params, function(err, results2){
                if(err){
                    console.log('error : ', err.message);
                }
                else{
                    conn.query(sql3, params, function(err, results3){
                        if(err){
                            console.log('error : ', err.message);
                        }
                        else{
                            console.log("전체가격")
                            console.log(results3);
                        res.render('snack/snack_pay', { test1 : results1, test2 : results2, test3:results3, point:point[0]});
                        }
                    })
                }
            })
        }
     });

    });
    
});

// 스낵 결제 완료 페이지 
router.get('/snack_comp/:snackpaynum',Middlewares.isLoggined, function(req,res){

    var snackpaynum= req.params.snackpaynum;
    
    // 스낵 결제 번호 불러오기 
    var sql = "SELECT SNACK_PAY_NUM FROM SNACK_PAY_HISTORY WHERE SNACK_PAY_NUM=? "
    var params =[snackpaynum];
    conn.query(sql, params, function(err, results){
        if(err){
            console.log('error : ' , err.message);
        }
        else{
            res.render('snack/snack_comp',{ snack_comp : results});
        }
    });  
});

router.post('/snack_pay/:userid', Middlewares.isLoggined, function(req,res){  
   
    var userid= req.params.userid; // 사용자 id 
    console.log(req.body.num.length);
    console.log(req.body.num[0]);

    var pay_way = req.body.way; // 결제 방법 
    var pay_state = "결제 완료"; // 결제 상태 
    var allprice = req.body.allprice ; // 전체 금액 

    var point_user_amount  = 0; 
    var point_use = req.body.discount; // 포인트 사용 여부 
    point_user_amount = point_user_amount + req.body.used_point; // 사용한 포인트 

    var end_price = allprice - point_user_amount; // 최종 결제 금액 
   
    var point_user_amount =req.body.used_point; // 사용할 포인트 

    console.log(Number(req.body.balancepoint));
    console.log(req.body.used_point);

    var BALANCE_AMOUNT = req.body.balancepoint; // 기존 포인트 
    console.log(req.body.balancepoint);
    BALANCE_AMOUNT = BALANCE_AMOUNT + (allprice *0.01) - point_user_amount; // 새롭게 업데이트 되는 포인트 
    console.log( BALANCE_AMOUNT);
    var newDate = new Date(); 
    var date = newDate.toFormat('YYYY-MM-DD HH24:MI:SS'); // 결제 금액 
    var date2= newDate.toFormat('HH24:MI:SS'); // primary key에 우선은 사용 
    var snackpaynum = 'sn'+date2;

    var params =[snackpaynum,userid,pay_way,pay_state,end_price, date, point_use,BALANCE_AMOUNT,"000","N"];

    var sql = "insert into SNACK_PAY_HISTORY VALUES (?,?,?,?,?,?,?,?,?,?)" // 결제 내역 insert 
    var sql2 = "insert into SNACK_LIST_PAY_HISTORY VALUES (?,?)" // m:n 관계 insert 
    var sql3 = 'DELETE FROM SNACK_TEST WHERE USER_ID =?' // 장바구니 초기화 
    var sql4 = 'UPDATE POINT_MANAGE SET BALANCE_AMOUNT = ? WHERE USER_ID = ?' // 포인트 update 

    var params2 =[userid];
    var params3 = [BALANCE_AMOUNT, userid];

    conn.query(sql, params, function(err, results){
        if(err){
         console.log('error : ' , err.message);
        }
        else{
            // 스낵  m: n 관계 해소 
            for( i = 0; i< req.body.num.length ; i++){
                var snack_num = req.body.num[i];
                var params= [snackpaynum, snack_num];
                conn.query(sql2, params,function(err, results){
                if(err){
                    console.log('error : ',err.message);
                }
                console.log("sql2");
                console.log(results);
            });
        conn.query(sql4, params3,function(err, results2){
            if(err){
                    console.log('error : ',err.message);
                }
            });
            console.log("sql4")

            conn.query(sql3, params2, function(err, results3){
                if(err){
                    console.log('error : ' , err.message);
                }
                else{
                   
                }
                console.log("sql3")
            console.log(results3);
            }); 
        }
        res.redirect('/snack/snack_comp/'+ snackpaynum); 
    }
});  

});


module.exports = router;
