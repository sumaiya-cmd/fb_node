var mongoose =require('mongoose');
var plm=require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/fb');

var userSchema= mongoose.Schema({
  username:String,
  name:String,
  password:String,
  posts:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users"
  }]
})

userSchema.plugin(plm);

module.exports=mongoose.model('users',userSchema);


