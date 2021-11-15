const mongoose =require('mongoose');

var postSchema=mongoose.Schema({
    imageurl:String,
    content:String,
    user:{type:mongoose.Schema.Types.ObjectId, ref:"post"},
    likes:[{
        type:mongoose.Schema.Types.ObjectId ,
        default:0
    }]
    
})

module.exports=mongoose.model("post",postSchema);