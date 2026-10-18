import React, { useEffect, useState } from 'react'
import { useParams,useNavigate } from 'react-router'
import Swal from "sweetalert2";


const Edit = () => {
    const {id}= useParams();
    const navigate = useNavigate();
    const date = new Date().toLocaleDateString("en-CA",{
  month: "long",
  day: "numeric",
  year: "numeric",
});
const token = localStorage.getItem("token")

    const [data, setdata] = useState({
    title: "",
    textarea: "",
});
async function fetchnote(id) {
    try {
        const response = await fetch("http://localhost:9000/getnotes", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch");
        }

        const notes = await response.json();

        const note = notes.find((item) => item._id === id);

        if (note) {
            setdata({
                title: note.title || "",
                textarea: note.textarea || "",
            });
        }

    } catch (error) {
        console.log(error);
    }
}
    useEffect(()=>{
        fetchnote(id);
    },[id]);

    async function Save(){
           try {
                const response = await fetch(`http://localhost:9000/edit/${id}`,{
                            method: "PATCH",
                            headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({...data,date}),
           });

                    if (!response.ok) {
                    throw new Error("Failed to fetch");
    }

        const result = await Swal.fire({
            title: "Your note is Updated Successfully",
            icon: "success",
            confirmButtonText: "OK"
            });

    if (result.isConfirmed) {
    navigate("/Notes");
    }
        
        

  } catch (error) {
    console.log(error);
  }  
    }
  return (
    <div className="addnotes">
      
      <div className="form">
        <div className="submitted">
          <input
            type="text"
            className="title"
            value={data.title || ""}
            onChange={(e)=>{setdata(prev =>({...prev,title:e.target.value}))}}
           
            placeholder="Enter title"
          />
          
         
        </div>
          

        <textarea
          name="text"
         value={data.textarea || ""}
         style={{ border:'none', outline: 'none'}}
         onChange={(e) =>
        setdata(prev => ({
            ...prev,
            textarea: e.target.value
        }))
    }
          
          placeholder="Write your note here..."
        ></textarea>
      </div><div>

        <button onClick={()=>Save()}>Save</button>
        <button onClick={()=>navigate("/Notes")}>Go Back</button>
      </div>
     </div>
  )
}

export default Edit