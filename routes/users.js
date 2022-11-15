var mongoose =require('mongoose');
var plm=require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/fb');

var userSchema= mongoose.Schema({
  username:String,
  name:String,
  password:String,
  email:String,
  secret:String,
  expiry:{
    type:Date
  },
  profilepic:[
    {type:String}
  ],
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }],
  story:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"story"
  },
  share:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }],
  followers:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users"
  }],
  following:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users"
  }]
})

userSchema.plugin (plm);

module.exports=mongoose.model('users',userSchema);


