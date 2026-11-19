import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const ALLERGENS = [ "Milk",
      "Peanut",
      "Gluten",
      "Soy",
      "Egg",
      "Tree nuts",
      "Sesame"];
const CONDITIONS = ["Diabetes",
      "High BP",
      "Thyroid",
      "PCOS",
      "Lactose intolerance"];
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        select:false,
        minlength:8,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    },
    healthProfile:{
        allergies:[{ type: String, enum: ALLERGENS }],
         conditions: [{ type: String, enum: CONDITIONS }],
           diet: {
    type: String,
    enum: [
      "Vegetarian",
      "Non-vegetarian",
      "Vegan",
      "Jain"
    ],
    default: "Vegetarian"
  }
        
    },
    profileCompleted:{
        type:Boolean,
        default:false,
    },
    language:{
        type:String,
        enum:['en','hi'],
        default:'en'
    },
    refreshToken:{
        type:String,
        select:false,
    },
    passwordResetToken:{
        type:String,
        select:false,
    },
    passwordResetExpiry:{
        type:Date,
        select:false,
    }
},{timestamps:true});
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return ;
    }
    this.password=await bcrypt.hash(this.password,10);
    
})
userSchema.methods.generateAccessToken=function(){
    
         const accessToken=jwt.sign({
            id:this._id,
            email:this.email,
         },process.env.JWT_ACCESS_TOKEN_SECRET,
         {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
         })
         return accessToken;
    
        console.log("erro in generating accesstoken");
        return error.message;

    
}
userSchema.methods.generateRefreshToken= function(){
    
    const refreshToken=jwt.sign({
        id:this._id
    },process.env.JWT_REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    })

    return refreshToken;
      
    
        console.log("error in generating refresh token");
        return error.message;
    
}
userSchema.methods.comparePassword=async function(password){
    const result=await bcrypt.compare(password,this.password);
    return result;
}
export const User=mongoose.model("User",userSchema);
