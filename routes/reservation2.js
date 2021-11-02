var express = require('express');
var db_config = require('../config/database');
var conn = db_config.init();
var router = express.Router();
var Middlewares = require('../middleware');

// 
router.get('/', Middlewares.isLoggined, function(req, res){

    // 선택된 것을 받는 것
    var movie_info = req.flash('movie')[0];
    var date = req.flash('date')[0];
    var schedules = req.flash('schdules_num');

    // 영화 정보, 상영 시간, SCREEN_BOX(상영관 정보)
    var movie_query = 'select * from MOVIE_INFO m where m.MOVIE_NUM in (select MOVIE_NUM from SCREEN_MOVIE_LIST s where m.MOVIE_NUM = s.MOVIE_NUM); '
    var schedules_query = 'select * from SCREEN_SCHEDULE where SCREEN_SCHEDULE_NUM=?';
    var screen_box_query = 'select * from SCREEN_BOX';

    console.log(movie_info);
    // movie_title 
    conn.query(movie_query, function(err, movies){
        if(err) return res.json(err);
        
        // 영화와 날짜를 선택한 것 => 해당 영화의 schedules들을 보여줌
        if( date && movie_info && schedules){
            
            console.log(movie_info.MOVIE_NUM);
            conn.query(screen_box_query, function(err, boxs){

                if(err) return res.json(err);
                
                return res.render('reservation/reservation',{movies: movies, movie_info: movie_info, date: date, schedules:schedules, boxs: boxs});
                /* 
                conn.query(schedules, schedule_nums.SCREEN_SCHEDULE_NUM , function(err, schedules){
                    if(err) return res.json(err);
                    console.log("render~~~~`");
                    console.log(schedules);
                    return res.render('reservation/reservation',{movies: movies, movie_info: movie_info, date: date, schedules:schedules, boxs: boxs});
                    
                });
                */
            });
            
        }
        // 영화와 날짜를 선택하지 않은 것 => schedules이 없음
        else{
            console.log("처음 부분");
            var schedules_empty = [];
            var boxs_empty = [];
            //var schedules_empty = {};
            conn.query(movie_query, function(err, movies){
                if(err) return res.json(err);
                return res. render('reservation/reservation',{movies:movies,movie_info: movie_info, date: date, schedules:schedules_empty, boxs: boxs_empty});

            });

        }
       
    });

    /*

    // moive_info가 없을 경우,
    if(!movie_info && !date){
    }
    // movie_info가 있는 경우 
    else if(!schedule) {
        return res.render('movies', {movies: movie_info, date: date, schedule: schedule});
    }
    else{
        return res.render('movies', {movies: movie_info, date: date, schedule: schedule});
    }
    */

});

// 상영 조회 일정
router.post('/reservate', Middlewares.isLoggined, function(req,res){

    console.log(req.body);

    var movie_query = 'select * from MOVIE_INFO where MOVIE_NUM=?';
    //var schedule_times = 'select SCREEN_START_TIME from SCREEN_SCHEDULE where SCREEN_DATE=? and MOVIE_NUM=?';
    var schedule_nums_query = 'select * from SCREEN_SCHEDULE where SCREEN_DATE=? and MOVIE_NUM=?';

    // 선택된 영화 정보
    conn.query(movie_query, req.body.movie_num, function(err, movie){
        if(err) res.json(err);

        req.flash('movie', movie);
        req.flash('date', req.body.date);
        //console.log(req.flash('movie'));
        //console.log(req.flash('date'));
    })



    // 영화 스케줄 => 여러개의 스케줄(해당 영화, 해당 일자의 스케쥴)
    conn.query(schedule_nums_query, [ req.body.date, req.body.movie_num ], function(err, schedules){

        if(err) return res.json(err);
        try{
            console.log("영화 스케줄 찾기");
            //console.log(typeof(schedule_nums));
            
            if(schedules.length == 0){
                console.log("노 스케줄");
                return res.redirect('/reservation2');
            }
            else {

                req.flash('schdules_num', schedules);
                console.log(schedules);
                console.log("예약 페이지로 render");
                // 예약하기 페이지로 render
                return res.redirect('/reservation2');
            }   
            
        }
        catch(err){
            console.log(err);

        }

        /* 
        console.log("영화 스케줄 찾기");
        console.log(typeof(schedule_nums));
        req.flash('schdules_num', schedule_nums);
        console.log("예약 페이지로 render");
        // 예약하기 페이지로 render
        return res.redirect('/reservation2');
        */

    })

});

// 예약하기 => 좌석하기로 render
router.post('/reservate2', function(req,res){

    req.flash('schedule_info', req.body.schedule);
    req.flash('adults', req.body.adults);
    req.flash('kids', req.body.kids);

    console.log('post/reservate2');
    console.log(req.body);

    return res.redirect('/reservation/reserve_seat/'+req.user.USER_ID);

});

module.exports = router;