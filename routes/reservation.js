var express = require('express');
var db_config = require('../config/database');
var conn = db_config.init();
var router = express.Router();
var mysql = require('mysql');
var Middlewares = require('../middleware');

//router.get('/', function(req, res){
    //var screen_schedule = req.flash('screen_schedule')[0] || {};
    //res.render('reservation/reservation', {screen_schedule : screen_schedule});
//});

router.get('/reserve_seat/:userid', Middlewares.isLoggined, function(req, res){

  var movie_num = req.flash('movie_num');
  var schedule_num = req.flash('schedule_info');
  var adults = req.flash('adults') || 0; 
  var kids = req.flash('kids') || 0;

  //var people_count = parseInt(adults) + parseInt(kids);
  var people_count = Number(adults) + Number(kids);
  var movie_title = req.body.MOVIE_TITLE;
  var screen_date = req.body.SCREEN_DATE;

  //console.log(schedule_num);
  //console.log(adults);
  //console.log(kids);

  if(!schedule_num && (!adults || !kids)){
    console.log("해당 정보가 없으면 이상함을 감지 => home으로 ");
    return res.redirect('/');
  }

  console.log('query start');
  //var query = 'SELECT SEAT_LIST.SCREEN_BOX_NUM, SEAT_LIST.SEAT_ROW, SEAT_LIST.SEAT_COL, SEAT_LIST.SEAT_USE_CHECK, SCREEN_SCHEDULE.SCREEN_BOX_NUM FROM SEAT_LIST JOIN SCREEN_SCHEDULE ON SEAT_LIST.SCREEN_BOX_NUM = SCREEN_SCHEDULE.SCREEN_BOX_NUM';
  var query1 = 'SELECT distinct SEAT_ROW FROM SEAT_LIST where SCREEN_SCHEDULE_NUM=?;';
  var params1 = [schedule_num];
  var query1s = mysql.format(query1, params1);

  var query2 = 'SELECT distinct SEAT_COL FROM SEAT_LIST where SCREEN_SCHEDULE_NUM=?;';
  var params2 = [schedule_num];
  var query2s = mysql.format(query2, params2);

  var query3 = 'SELECT SEAT_USE_CHECK FROM SEAT_LIST where SCREEN_SCHEDULE_NUM=?;';
  var params3 = [schedule_num];
  var query3s = mysql.format(query3, params3);

  var query4 = 'SELECT SEAT_ROW FROM SEAT_LIST where SCREEN_SCHEDULE_NUM=?;';
  var params4 = [schedule_num];
  var query4s = mysql.format(query4, params4);

  var query5 = 'SELECT SEAT_COL FROM SEAT_LIST where SCREEN_SCHEDULE_NUM=?;';
  var params5 = [schedule_num];
  var query5s = mysql.format(query5, params5);

  var query6 = 'SELECT SCREEN_SCHEDULE.SCREEN_DATE, MOVIE_INFO.MOVIE_TITLE FROM SCREEN_SCHEDULE JOIN MOVIE_INFO ON SCREEN_SCHEDULE.MOVIE_NUM = MOVIE_INFO.MOVIE_NUM WHERE SCREEN_SCHEDULE_NUM=?;';
  var params6 = [schedule_num];
  var query6s = mysql.format(query6, params6);
  //var params = [SCREEN_BOX_NUM, SEAT_ROW, SEAT_COL, SEAT_USE_CHECK,];
  var params = [schedule_num, adults, kids, people_count, movie_title, screen_date];
  conn.query(query1s + query2s + query3s + query4s + query5s + query6s, params, function(err, seat_list) {
      if(err) console.log('err: ', err.message);
      else {
        console.log(seat_list[0][0]);
        //console.log(seat_list[2][1]);
        var use_check = seat_list[2];
        //console.log(params[0]);
        //console.log(seat_list.MOVIE_TITLE);
        //console.log(seat_list[5][0].MOVIE_TITLE);
        res.render('reservation/reserve_seat', {row:seat_list[0], col:seat_list[1], use_check:seat_list[2], rows:seat_list[3], cols:seat_list[4], schedule_num:params[0], adults:params[1], kids:params[2], people_count:people_count, movie_title:seat_list[5][0].MOVIE_TITLE, screen_date:seat_list[5][0].SCREEN_DATE});
        console.log(people_count);
     }
      console.log(seat_list[2]); //
  });
});





router.post('/reservation_pay/:userid', Middlewares.isLoggined, function(req, res){

    req.flash('schedule_info', req.body.schedule);
    req.flash('adults', req.body.adults);
    req.flash('kids', req.body.kids);
    //console.log(req.body.test);
    var movie_title = req.body.movie_title;
    var screen_dates = req.body.screen_date;
    var schedule_info = req.body.schedule;
    //console.log(schedule_info);
    var screen_box_num = req.body.SCREEN_BOX_NUM;
    var screen_date = req.body.SCREEN_DATE;
    var movie_num = req.body.MOVIE_NUM;
    var user_id= req.params.userid;
    var pay_price = 11000 * req.body.adults + 8000 * req.body.kids; // 결제 가격 


    var point_query = "select *from POINT_MANAGE where POINT_USE_DATE=(select MAX(POINT_USE_DATE)FROM POINT_MANAGE where USER_ID=?)";


    var seat_row = req.body.test;
    //console.log(req.body.seat_rows.length);
    var seat_col = req.body.test2;
    //var seat_use_check = req.body.SEAT_USE_CHECK;

    var query = 'SELECT SCREEN_BOX_NUM, SCREEN_DATE, MOVIE_NUM FROM SCREEN_SCHEDULE WHERE SCREEN_SCHEDULE_NUM = ?';
    var params = [schedule_info];
    //var params = [schedule_num, adults, kids,];

    conn.query(point_query, req.params.userid, function(err, point){
        
      conn.query(query, params, function(err, result) {
        if(err) console.log('err: ', err.message);
        else {

          res.render('reservation/reservation_pay', {screen_box_num:result[0].SCREEN_BOX_NUM, screen_date:result[0].SCREEN_DATE, movie_num:result[0].MOVIE_NUM, seat_row:seat_row, seat_col:seat_col, screen_dates:screen_dates, movie_title:movie_title, adults:req.body.adults, kids:req.body.kids, point:point[0], pay_price:pay_price});
       }

    });
  });

});

router.get('/reservation_comp/:userid', Middlewares.isLoggined, function(req, res){
  //router.get('/reservation_comp', function(req, res){
      if(err) console.log('err: ', err.message);
      else {
        res.render('reservation/reservation_comp');
      }
  });
  

router.post('/reservation_comp/:userid', Middlewares.isLoggined, async function(req, res){

  var movie_num = req.body.MOVIE_NUM; // 영화 번호 
  
  var user_id = req.params.userid; // 유저 아이디 
  var screen_date = req.body.SCREEN_DATE; // 상영 시간 
  // kids = 0; 
  var adult = req.flash('adults') || 0; 
  var kids = req.flash('kids') || 0;

  // var people_count = parseInt(adult) + parseInt(kids); 인원수 
  var ticket_price = 11000 * adult + 8000 * kids; // 결제 가격 

  var screen_schedule_num = req.flash('schedule_info');
  var screen_box_num = req.body.SCREEN_BOX_NUM; // 상영관 번호 

  var newDate = new Date();
  var date = newDate.toFormat('HH24:MI:SS'); // 결제 시간 
 
  var user_ticket_pay_num = "tk" + date + user_id; // 티켓 결제 번호 
  var pay_way = req.body.PAY_WAY; // 결제 방법 
  var pay_state = "결제 완료"; // 결제 상태 
  var pay_price = 11000 * adult + 8000 * kids - req.body.used_point; // 결제 가격 
  var pay_date = newDate.toFormat('YYYY-MM-DD HH24:MI:SS'); // 결제 시간 

  var point_user_check = req.body.discount; // 포인트 사용 여부
  
  console.log('사용자 포인트');
  console.log(req.body.used_point);
  if(req.body.used_point == ''){
    var point_user_amount = 0;
  }else var point_user_amount = parseInt(req.body.used_point); // 사용할 포인트 
  var BALANCE_AMOUNT = req.body.balancepoint; // 기존 포인트 
  console.log(point_user_amount);
  console.log(BALANCE_AMOUNT);

  BALANCE_AMOUNT = (pay_price *0.01)+(BALANCE_AMOUNT - point_user_amount); // 새롭게 업데이트 되는 포인트 
  console.log(BALANCE_AMOUNT);
  var approve_num = 1; // 승인 번호 

  var query1 = 'INSERT INTO TICKET_MANAGE(MOVIE_NUM, USER_ID, SCREEN_DATE, TICKET_PRICE, KIDS, ADULT) VALUES(?,?,?,?,?,?);';
  var params1 = [movie_num, user_id, screen_date, pay_price, kids, adult];
  var query1s = mysql.format(query1, params1);
  var ticket_num = 0;
  var query2 = 'INSERT INTO TICKET_SEAT_LIST(TICKET_NUM,SCREEN_BOX_NUM, SCREEN_SCHEDULE_NUM, SEAT_ROW, SEAT_COL) VALUES(?,?,?,?,?);';
  //var params2s = [ticket_num, screen_box_num, screen_schedule_num, seat_row, seat_col];
  //var query2s = mysql.format(query2, params2);

  var query3 = 'INSERT INTO USER_PAY_HISTORY(USER_TICKET_PAY_NUM, USER_ID, PAY_WAY, PAY_STATE, PAY_PRICE, PAY_DATE, POINT_USER_CHECK, POINT_USER_AMOUNT, APPROVE_NUM, TICKET_NUM) VALUES(?,?,?,?,?,?,?,?,?,?);';
  var query4 = 'UPDATE SEAT_LIST SET SEAT_USE_CHECK="Y" WHERE SCREEN_BOX_NUM=? AND SCREEN_SCHEDULE_NUM=? AND SEAT_ROW=? AND SEAT_COL=?;';


  var query5 = 'UPDATE POINT_MANAGE SET BALANCE_AMOUNT = ? WHERE USER_ID = ?' // 포인트 update 
  var params5 = [ BALANCE_AMOUNT, user_id];

  conn.query(query1s,function(err, result) {
    if(err) {
      console.log('error1 :', err.message);
    }
    //var query3_result = result[user_pay_history[0]];
    else {
      ticket_num = result.insertId;
      console.log(result);
      console.log("지원2" + ticket_num);
      var params3 = [user_ticket_pay_num, user_id, pay_way, pay_state, pay_price, pay_date, point_user_check, point_user_amount, approve_num,ticket_num];
      conn.query(query3, params3, function(err, result2) {
        if(err) {
          console.log('error2 :', err.message);
        }
        console.log(req.body.SEAT_ROW);
        console.log(req.body.SEAT_COL);
        console.log(req.body.SEAT_ROW.length);
        console.log(ticket_num);

      for(i = 0; i < req.body.SEAT_ROW.length ; i ++){
        var seat_row = req.body.SEAT_ROW[i];
        var seat_col = req.body.SEAT_COL[i];

        if( !Number(seat_row) && !Number(seat_col) ){
          continue;

        }
        else{
          var params2 = [ticket_num,screen_box_num, screen_schedule_num, seat_row, seat_col];
          conn.query(query2, params2, function(err, result1) {
            if(err) {
              console.log('error3 :', err.message);
            }
          });

          var params4 = [screen_box_num, screen_schedule_num, seat_row, seat_col];
          console.log("params4")
          console.log(params4);
          conn.query(query4, params4, function(err, result4) {
            if(err) {
              console.log('error4 :', err.message);
            }
            else{

            }
          });

        }
      }
      conn.query(query5, params5, function(err, result4) {
        if(err) {
          console.log('error4 :', err.message);
        }
      });
          return res.render('reservation/reservation_comp', {user_ticket_pay_num:user_ticket_pay_num});


      });

    }

  });



});


module.exports = router;

function getDate(dateObj){
    if(dateObj instanceof Date)
      return dateObj.getFullYear() + '-' + get2digits(dateObj.getMonth()+1)+ '-' + get2digits(dateObj.getDate());
  }