var express = require('express');
var router = express.Router();
var db_config = require('../config/database');
var conn = db_config.init();

// movie_info: 영화 상세 설명 페이지
router.get('/:movie_num', function(req, res){

    var movie_info = 'select * from MOVIE_INFO where MOVIE_NUM=?;';
    var movie_Genre = 'select GENRE_NUM from MOVIE_GENRE where MOVIE_NUM=?;'
    var genre_name_query = 'select * from GENRE g where g.GENRE_NUM=any(select GENRE_NUM from MOVIE_GENRE mv where mv.MOVIE_NUM=?)';
    var movie_photo_query = 'select * from MOVIE_PHOTO where MOVIE_NUM=?;';
    var movie_num = parseInt(req.params.movie_num);
    console.log(movie_num);

    // 장르 이름
  conn.query(genre_name_query, movie_num, function (err, genres) {
        if (err)
            return res.json(err);
        //console.log(genre_names);
        conn.query(movie_info, movie_num, function(err, movie_info){
            if(err) return res.json(err);
            console.log(genres);
            console.log(movie_info);
            conn.query(movie_photo_query, movie_num, function(err, movie_photo){
                if(err) return res.json(err);
                console.log(movie_photo);
                return res.render('movie/movie_info',{movie_info: movie_info[0], genres:genres, movie_photo:movie_photo[0]})
            })
            //return res.render('movie/movie_info', {movie_info: movie_info[0], genres:genres});
        })

    });
    
});

module.exports = router;