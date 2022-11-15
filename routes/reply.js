const mongoose =require('mongoose');

var replySchema=mongoose.Schema({
    reply:String,
    
    like:{
        type:Array,
        default:[]
    },
    comment:[{type:mongoose.Schema.Types.ObjectId ,ref:"comment"}]
    ,
    author:{type:mongoose.Schema.Types.ObjectId, ref:"users"}
})

module.exports=mongoose.model("reply",replySchema);