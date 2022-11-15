const mongoose =require('mongoose');

var storySchema=mongoose.Schema({
    imageurl:{
        type:String,
        default:null
    },
    createdAt: { type: Date, default: Date.now, expires: '1m'  },
    user:{type:mongoose.Schema.Types.ObjectId, ref:"users"},
})

module.exports=mongoose.model("story",storySchema);