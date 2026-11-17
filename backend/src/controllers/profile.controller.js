export const getProfile=async(req,res)=>{
    try{
       const user=req.user;
       if(!user){
        return res.status(404).json({
            message:"user is not"
        })
       }
       return res.status(200).json({
        healthProfile:user.healthProfile,
        profileCompleted:user.profileCompleted,
         language:user.language
       })
    }catch(error){
        return res.status(500).json({
            message:"something went wrong",
            error:error.message
        })

    }
}

export const updateProfile=async(req,res)=>{
    try{
        const{allergies,conditions,diet}=req.body;
        let update=false;
        const user=req.user;
        if (allergies !== undefined && !Array.isArray(allergies)) {
  return res.status(400).json({ message: "allergies must be an array" });
}
if (conditions !== undefined && !Array.isArray(conditions)) {
  return res.status(400).json({ message: "conditions must be an array" });
}
        if(allergies!=undefined){
        user.healthProfile.allergies=allergies;
        update=true;
        }
        if(conditions!=undefined){
        user.healthProfile.conditions=conditions;
        update=true;
        }
        if(diet!=undefined){
        user.healthProfile.diet=diet;
        update=true;
        }
        if(update){
        user.profileCompleted=true;
        }
        await user.save();
        return res.status(200).json({
            message:"profile updated successfully",
            healthProfile:user.healthProfile,
            profileCompleted:user.profileCompleted
        })
    }catch(error){

        if (error.name === "ValidationError") {
  return res.status(400).json({ message: "Invalid allergy, condition or diet value" });
}


        return res.status(500).json({
            message:"something went wrong",
            error:error.message
        })
    }
}