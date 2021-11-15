var express = require('express');
var router = express.Router();
const passport=require('passport');
const localstrategy=require('passport-local')
const userModel=require('./users');
const postModel=require('./post');


passport.use(new localstrategy(userModel.authenticate()));

router.get('/', function(req, res, next) {
  res.render('index');
});


router.post('/createpost', function(req, res) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    postModel.create({
      imageurl:req.body.imageurl,
      content:req.body.content,
      user:founduser._id,
    })
    .then(function(post){
      founduser.posts.push(post),
      founduser.save()
      .then(function(){
        res.redirect('/profile')
      })
    })
  })
});


router.get('/profile',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .populate("posts")
  .then(function(founduser){
    console.log(founduser)
    res.render('profile',{userdata:founduser})
  })
})


router.post('/register',function(req,res,next){
    var newUser=new userModel({
      username:req.body.username,
      name:req.body.name,
    })
    userModel.register(newUser, req.body.password)
    .then(function(u){
      passport.authenticate('local')(req,res,function(){
        res.redirect('/profile')
      })
    })
    .catch(function(e){
      res.send(e);
    })
  });
  
router.post('/login',passport.authenticate('local',{
    successRedirect:'/profile',
    failureRedirect:'/'
}),function(req,res,next){});
  
router.get('/logout',function
  (req,res,next){
    req.logOut();
    res.redirect('/');
 })

  
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
      return next();
    } 
    else{
      res.redirect('/');
    }
    
  }

module.exports = router;
