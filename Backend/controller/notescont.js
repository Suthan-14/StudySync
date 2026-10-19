const notes = require('../model/notes')


exports.Addnotes = async (req,res,next)=>{

    try {
        
        const {title,textarea,date,pin} = req.body;
        const addnotes = new notes({title,textarea,date,pin,user: req.user.userId});
        await addnotes.save();

        res.status(201).json({
            message: "Notes created successfully",
            task: addnotes
        });
    } catch (error) {
         res.status(500).json({
            message: error.message
        });
    }
};

exports.Getnotes = async (req,res,next)=>{

    try {
       
        
        const usernotes = await notes.find({user:req.user.userId });
        if(!usernotes){
            return res.status(401).json({message:'invalid user'})
        }

        res.status(200).json(usernotes);
    } catch (error) {
         res.status(500).json({
            message: "Error getting tasks",
            error: error.message
        });
    }

};

exports.Upnotes = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updatenotes = await notes.findOneAndUpdate(
            {
                _id: id,
                user: req.user.userId
            },
            req.body,
            {
                  returnDocument: "after"
            }
        );

        if (!updatenotes) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.status(200).json({
            message: "Task updated successfully",
            task: updatenotes
        });

    } catch (error) {
        console.error("Update error:", error);

        res.status(500).json({
            message: "Error updating task",
            error: error.message
        });
    }
};

exports.Deletenotes = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const del = await notes.findOneAndDelete({_id:id,user:req.user.userId})

        if(!del){
            return res.status(401).json({message:" Task doesn't exsist "})
        }

        res.status(201).json({message:" successfully deleted "});

    } catch (error) {
         res.status(500).json({
            message: "Error deleting task",
            error: error.message
        });
    }
}

exports.uppin = async (req, res,next) => {
    try {
        const { id } = req.params;
        const { pin } = req.body;

        const updatedNote = await notes.findOneAndUpdate(
            {
                _id: id,
                user: req.user.userId
            },
            {
                $set: {
                    pin: pin
                }
            },
            {
                    returnDocument: "after" 

            }
        );

        if (!updatedNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        res.status(200).json({
            message: "Note updated successfully",
            note: updatedNote
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating note",
            error: error.message
        });
    }
};

exports.Edit = async (req,res,next)=>{

     try {
        const { id } = req.params;
        const { title,textarea } = req.body;

        const updatedNote = await notes.findOneAndUpdate(
            {
                _id: id,
                user: req.user.userId
            },
            {
                $set: {
                    title:title,
                    textarea:textarea
                }
            },
             {
                 returnDocument: "after",
                 runValidators: true
    }
        );

        if (!updatedNote) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        res.status(200).json({
            message: "Note updated successfully",
            note: updatedNote
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating note",
            error: error.message
        });
    }
}

exports.GetOnenotes = async (req,res,next)=>{
    try {
        const {id} = req.params;
        const note = await notes.findOne({_id:id,user:req.user.userId});
        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }
        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching note",
            error: error.message
        });
    }   
}

exports.dashboard = async (req,res,next)=>{
    try {
    const note = await notes.findOne({
      user: req.user.userId,
    }).sort({ date: -1 });

    res.status(200).json(note);
  } catch (error) {
    console.error("Error fetching recent note:", error);

    res.status(500).json({
      message: "Failed to fetch recent note",
    });
  }
}