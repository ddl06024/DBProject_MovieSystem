var express = require('express');
var db_config = require('../config/database');
var conn = db_config.init();
var router = express.Router();

require("date-utils");

//회원가입 페이지로 
router.get('/register', function(req, res){
    var user = req.flash('user')[0] || {};
    var errors = req.flash('errors')[0] || {};
    return res.render('users/register2', {user: user , errors: errors});
})

// user create: 아직 상세히 안하고 바로 insert
router.post('/', function(req, res){

    var errors = {};
    
    // req.body -> var
    var user_id = req.body.USER_ID; 
    
    // 아이디 중복 확인
    var dup_id = 'select USER_ID from USER_LIST where USER_ID=?';

    conn.query(dup_id, user_id, function(err, result){
        if(err) return res.json(err)
        
        console.log(result.length);

        // 중복된 id가 존재하는 경우 
        if(result.length == 1){
            errors.message = "아이디가 중복됩니다. 다른 아이디를 입력해주세요"
            req.flash('errors', errors);
            console.log("중복됩니다!!!1");
            return res.redirect('/users/register');
        }
        // 중복된 id가 없는 경우
        else{
            console.log("insert 문 시작");
            var user_name = req.body.USER_NAME;
            var resident_num = req.body.RESIDENT_NUM;
            var user_pw = req.body.USER_PW;
            var email = req.body.EMAIL;
            var phone_num = req.body.PHONE_NUM;
            var newDate = new Date(); 
            var date = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
            var query_point = "insert POINT_MANAGE(USER_ID,POINT_USE_DATE) values(?,?)"
            var params2 = [user_id,date];
            var query = 'insert USER_LIST(USER_ID, USER_NAME, USER_PW,EMAIL, PHONE_NUM, RESIDENT_NUM) values(?,?,?,?,?,?)'
            var params = [user_id, user_name, user_pw, email, phone_num, resident_num,]
            conn.query(query, params, function(err, result){
                if(err) return res.json(err);
                //console.log(result);
                else{
                    conn.query(query_point,params2, function(err, result){
                        if(err) res.json(err)
                        else return res.redirect('/');

                    })

                }
                
            });
        }
    });

});


module.exports = router;

/* private function - 비밀번호 일치 확인 => ejs에서 처리 */
function check_password(req, res, next){

    var password = req.body.USER_PW;
    var confirm_password = req.body.USER_PW_CHECK;

    // 회원가입 시, 비밀번호 일치하는지 확인   
    if( password != confirm_password){
        
    }
    next();
}