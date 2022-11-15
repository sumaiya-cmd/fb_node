const mongoose =require('mongoose');

var postSchema=mongoose.Schema({
    imageurl:String,
    content:String,
    user:{type:mongoose.Schema.Types.ObjectId, ref:"users"},
    likes:{
        type:Array,
        default:[]
    },
    comments:[
        {type:mongoose.Schema.Types.ObjectId, ref:"comment"
        }
    ],
    follow:{
        type:Array,
        default:[]
    }
})

module.exports=mongoose.model("post",postSchema);