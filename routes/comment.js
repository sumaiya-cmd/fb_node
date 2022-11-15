const mongoose =require('mongoose');

var commentSchema=mongoose.Schema({
    comments:String,
    Date:{
        type: Date,
        default: Date.now
    },
    like:{
        type:Array,
        default:[]
    },
    reply:[{type:mongoose.Schema.Types.ObjectId ,ref:"reply"}]
    ,
    post:{type:mongoose.Schema.Types.ObjectId, ref:"post"},
    writer:{type:mongoose.Schema.Types.ObjectId, ref:"users"}
})

module.exports=mongoose.model("comment",commentSchema);