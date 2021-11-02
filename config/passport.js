var passport = require('passport');
var Local_Strategy = require('passport-local').Strategy;
var db_config = require(__dirname + '/database');
var conn = db_config.init();

passport.serializeUser(function(user, done){
    // user의 id 저장
    done(null, user.USER_ID);
});

passport.deserializeUser(function(USER_ID, done){
    
    var find_user = 'select * from USER_LIST where USER_ID=?';
    conn.query(find_user, USER_ID, function(err, user){
        if(err) done(err);
        //console.log(result);
        //var json = JSON.stringify(result[0]);
        //var user = JSON.parse(json);
        done(null, user[0]);
    })
    
})

// local-strategy
passport.use('local-login', new Local_Strategy({
    usernameField: 'username',
    passwordField: 'password',
    session: true
    },
    function(username, password, done){
        
        console.log('local-strategy');
        var find = 'select * from USER_LIST where USER_ID=?;';
        conn.query(find, username, function(err, user){
            console.log(user);
            if(err) return done(err);
            // 해당 사용자가 없을 경우
            if(user.length == 0){
                return done(null, false, {message:'해당 ID를 가진 사용자가 존재하지 않습니다.'});
            }
            //console.log('result[0]'+ result[0]);
            //var json = JSON.stringify(result[0]);
            //var user = JSON.parse(json);
            //console.log('user'+ user);
            /* 비밀번호가 일치하지않을 경우 */
            if(password != user[0].USER_PW){
                return done(null, false, {message: '비밀번호가 일치하지않습니다.'});
            }
            return done(null, user[0]);
        })
    }
))

module.exports = passport;
