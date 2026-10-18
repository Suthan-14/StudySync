const Session = require("../model/timer");

exports.timer = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-CA");

    let existing = await Session.findOne({
      userId: req.user.userId,
      date: today,
    });

    if (existing) {
      existing.sessions += 1;
      await existing.save();
    } else {
      existing = await Session.create({
        userId: req.user.userId,
        date: today,
        sessions: 1,
      });
    }

    res.status(200).json({
      message: "Session completed successfully",
      session: existing.sessions,
      date: today,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to save session",
    });
  }
};

exports.Gettimer = async (req,res,next)=>{
  try {
          console.log("userId",req.user.userId);
          console.log("user",req.user);
          
          const session = await Session.find({userId:req.user.userId });
          if(!session){
              return res.status(401).json({message:'invalid user'})
          }
  
         
         
          
  
          res.status(200).json(session);
      } catch (error) {
           res.status(500).json({
              message: "Error getting tasks",
              error: error.message
          });
      }
  
}