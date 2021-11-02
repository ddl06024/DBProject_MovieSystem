var Middlewares = {};

// 로그인이 계속 되어 있는가??
Middlewares.isLoggined = function(req, res, next){

    var errors = {};

    if(req.isAuthenticated()){
        next();
    }
    // login page로 
    else{
        errors.login_need = "로그인을 해주세요";
        req.flash('errors',errors);
        return res.redirect('/login');
    }

}

module.exports = Middlewares;