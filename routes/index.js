var express = require('express');
var router = express.Router();
var multer=require('multer');
const passport=require('passport');
const localstrategy=require('passport-local')
const userModel=require('./users');
const commentModel=require('./comment');
const replyModel=require('./reply');
const postModel=require('./post');
const storyModel=require('./story')
const { populate } = require('./users');
const post = require('./post');
const Jimp = require('Jimp');
const sendmail = require('./nodemailer')
const { v4: uuidv4 } = require('uuid');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/upload')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix  + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

const storiesstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/stories')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix  + '-' + file.originalname)
  }
})

const stories = multer({ storage: storiesstorage })

passport.use(new localstrategy(userModel.authenticate()));

router.get('/',checkloggin , function(req, res, next) {
  res.render('index',{pagename:"index",loginhai:false});
});

router.post('/uploads' ,isLoggedIn, upload.single('image'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    Jimp.read(`./public/images/upload/${req.file.filename}`, (err, lenna) => {
      if (err) throw err;
      lenna
        .resize(256, 256) // resize
        .quality(60) // set JPEG quality
        //.greyscale() // set greyscale
        .write(`./public/images/upload/${req.file.filename}`); // save
        founduser.profilepic.push(req.file.filename )
        founduser.save()
        .then(function(){
          res.redirect('/profile')
        })
    });
  })
})

router.post('/stories' ,isLoggedIn, stories.single('image'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    storyModel.create({
      imageurl:req.file.filename,
      user:founduser._id
    }) 
    .then(function(storycreated){
      founduser.story=storycreated
      founduser.save()
      .then(function(){
        res.redirect('/profile')
      })
    })
    
  })
})

router.get('/allpic',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    res.render('showprofile',{user:founduser,loginhai:true,pagename:"profilepics"})
  })
})

router.get('/set/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    founduser.profilepic.push(founduser.profilepic[req.params.id]);
    founduser.profilepic.splice(req.params.id,1)
    founduser.save()
    .then(function(){
      res.redirect('/profile');
    })
  })
})

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
  .populate("story")
  .populate({path:"share",
    populate:{path:"user"}})
  .then(function(founduser){
    // console.log(founduser)
    res.render('profile',{userdata:founduser,pagename:"profile ",loginhai:true})
  })
})

router.get('/register',function(req,res,next){
  res.render('register',{pagename:"register",loginhai:false})
})

router.get('/share/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loginuser){
    postModel.findOne({_id:req.params.id})
    .then(function(foundpost){
      loginuser.share.push(foundpost)
      loginuser.save()
      .then(function(){
        res.redirect('/profile');
      })
    })
  })
})

router.get('/like/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    postModel.findOne({_id:req.params.id})
    .then(function(post){
      if(post.likes.indexOf(founduser._id)===-1){
          post.likes.push(founduser._id)
      }
      else{
        var index= post.likes.indexOf(founduser._id );
        post.likes.splice(index,1);
      }
      post.save()
      .then(function(){
        res.redirect(req.headers.referer);
      })
    })
  })
})

router.get('/likecmnt/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    commentModel.findOne({_id:req.params.id})
    .then(function(comnt){
      if(comnt.like.indexOf(founduser._id)===-1){
        comnt.like.push(founduser._id)
    }
    else{
      var index= comnt.like.indexOf(founduser._id );
      comnt.like.splice(index,1);
    }
    comnt.save()
    .then(function(){
      res.redirect(req.headers.referer);
    })
    })
  })
})

router.get('/delete/:id',isLoggedIn,function (req,res) {
    postModel.findOneAndDelete({_id:req.params.id})
    .then(function () {
      res.redirect('/profile')
    })
})

router.get('/edit/:id',function (req,res) {
  postModel.findOne({_id:req.params.id})
  .then(function (post) {
      res.render('edit',{post});
  })
})

router.post('/update/:id',function(req,res){
  var data={
    imageurl:req.body.imageurl,
    content:req.body.content
  }
  postModel.findOneAndUpdate({_id:req.params.id},data)
  .then(function(){
    res.redirect('/profile')
  })
})

router.get('/timeline',function(req,res){
  postModel.find()
  .populate("user")
  .populate({path:"comments",
      populate:{path:"writer"}})
  .then(function(allpost){
    res.render('timeline',{posts:allpost,pagename:"timeline" , loginhai:true})
  })
})

router.post('/comment/:postid',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    postModel.findOne({ _id:req.params.postid})
    .then(function(post){
      commentModel.create({
        comments:req.body.comments,
        post:post,
        writer:founduser
      })
      .then(function(createdcmnt){
        post.comments.push(createdcmnt)
        post.save()
        .then(function(){
          res.redirect('/timeline');
        })
      })
      })
    })
})

router.get('/allcmnt/:id',function(req,res){
    postModel.findOne({_id:req.params.id})
    .populate({
      path:"comments",
      populate:{path:"writer"}
    })
    .then(function(posts){
        res.render('comments',{posts,pagename:"allcomments",loginhai:true})
    })
})

router.post('/reply/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loginuser){
    commentModel.findOne({_id:req.params.id})
    .then(function(cmnt){
      replyModel.create({
        reply:req.body.reply,
        author:loginuser._id,
        comment:cmnt._id
      })
      .then(function(createdreply){
        cmnt.reply.push(createdreply)
        cmnt.save()
        .then(function(){
          res.redirect('/timeline')
        })
      })
    })
  })
})

router.get('/reply/:id', function(req,res){
  res.render('reply')
})

router.get('/showreply/:id',function(req,res){
    commentModel.findOne({_id:req.params.id})
    .populate({
      path:"reply",
      populate:{path:"author"}
    })
    .then(function(cmnt){
      res.render("reply",{cmnt,pagename:"showreplies",loginhai:true})
    })
})

router.get('/likereply/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(founduser){
    replyModel.findOne({_id:req.params.id})
    .then(function(reply){
      if(reply.like.indexOf(founduser._id)===-1){
        reply.like.push(founduser._id)
    }
    else{
      var index= reply.like.indexOf(founduser._id );
      reply.like.splice(index,1);
    }
    reply.save()
    .then(function(){
      res.redirect(req.headers.referer);
    })
    })
  })
})

router.post('/search',isLoggedIn,function(req,res){
  userModel.find( { 'username' : { '$regex' : req.body.search, '$options' : 'i' } } )
  .then(function(alldata){
    res.render('allsearched',{alldata,pagename:"seracheduser",loginhai:true})
  })
})

router.get('/searchOnClick/:id',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function (loginuser) {
    userModel.findOne({ _id:req.params.id })
    .populate("posts")
    .then(function(founduser){
      console.log(founduser)
      res.render('search',{userdata:founduser,pagename:"search",loginuser,loginhai:true})
    })
  })   
})

router.get('/follow/:id',function(req,res){
  userModel.findOne({ username:req.session.passport.user })
  .then(function(loginuser){
    userModel.findOne({ _id: req.params.id })
    .then(function(searcheduser){
      if(searcheduser.followers.indexOf(loginuser._id)===-1){
         searcheduser.followers.push(loginuser._id)
        searcheduser.save()
        .then(function(){
          loginuser.following.push(searcheduser._id)
          loginuser.save()
          .then(function(){
            res.redirect(`/searchOnClick/${searcheduser._id}`)
          })
        })
      }
      else{
        var index1=searcheduser.followers.indexOf(loginuser._id)
        var index2=loginuser.following.indexOf(searcheduser._id)
        searcheduser.followers.splice(index1,1);
        searcheduser.save()
        .then(function(){
          loginuser.following.splice(index2,1);
          loginuser.save()
          .then(function(){
            res.redirect(`/searchOnClick/${searcheduser._id}`)
          })
        }) 
      }  
    })
  })
})

router.get('/unfollow/:id',function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(loginuser){
    userModel.findOne({_id:req.params.id})
    .then(function(searcheduser){
      if(searcheduser.followers.indexOf(loginuser._id)===-1){
        searcheduser.followers.push(loginuser._id)
          searcheduser.save()
        .then(function(){
          loginuser.following.push(searcheduser._id)
          loginuser.save()
          .then(function(){
            res.redirect(`/searchOnClick/${searcheduser._id}`)
          })
        })
      }
      else{
        var index1=searcheduser.followers.indexOf(loginuser._id)
        var index2=loginuser.following.indexOf(searcheduser._id)
        searcheduser.followers.splice(index1,1);
        searcheduser.save()
        .then(function(){
          loginuser.following.splice(index2,1);
          loginuser.save()
          .then(function(){
            res.redirect(`/searchOnClick/${searcheduser._id}`)
          })
        }) 
      }  
    })
  })
})

router.get('/followers/:id',function(req,res){
  userModel.findOne({ _id:req.params.id})
  .populate("followers")
  .then(function(founduser){
      res.render('followers',{founduser,pagename:"followers",loginhai:true});
  })
})

router.get('/following/:id',function(req,res){
  userModel.findOne({ _id:req.params.id})
  .populate("following")
  .then(function(founduser){
      res.render('following',{founduser,pagename:"following",loginhai:true});
  })
})

router.post('/newpassword/:id',function(req,res){
    userModel.findOne({ _id:req.params.id})
    .then(function(founduser){
      if(req.body.password1 === req.body.password2){
        founduser.setPassword(req.body.password1, function(){
          founduser.save()
          .then(function(){
            req.logIn(founduser, function(){
              res.redirect('/profile');
            })
          })
        })
      }
      
    })
})

router.get('/reset/:id/:secret',function(req,res){
  userModel.findOne({_id:req.params.id})
  .then(function(founduser){
    if((founduser.secret === req.params.secret) && (founduser.expiry > Date.now() ) ){
      res.render("newpassword",{founduser,pagename:"newpassword",loginhai:false});
    }
    else{
      res.send("user invalid")
    }
  })
})

router.get('/reset',function(req,res){
  res.render("resetpassword",{pagename:"resetpassword",loginhai:false})
})

router.post('/reset',function(req,res){
  var secretkey = uuidv4();
  userModel.findOne({email:req.body.email})
  .then(function(founduser){
    if(founduser!==null){
      founduser.secret = secretkey ;
      founduser.expiry = Date.now() + 24*60*60*1000 ;
      founduser.save()
      .then(function(){
        sendmail(req.body.email,`http://localhost:3000/reset/${founduser._id}/${secretkey}`)
        .then(function(){
          res.send("email sent");
        })
      })
    }
    else{
      res.send("no such usermail exits!")
    }
  })
})

router.post('/register',function(req,res,next){
    var newUser=new userModel({
      username:req.body.username,
      name:req.body.name,
      email:req.body.email
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

    
function checkloggin(req,res,next){
  if(req.isAuthenticated()){
    res.redirect('/profile');
  } 
  else{
    return next();
  }
  
}

module.exports = router;
