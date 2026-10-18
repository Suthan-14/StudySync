import React, { useState } from "react";
import "./addnote.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import axios from 'axios';

const AddNote = () => {
  const usnavigate = useNavigate()
  const [title,settitle] = useState("");
  const [textarea,settextarea] = useState("");
  const [pin,setpin] = useState(false)
  const date = new Date().toLocaleDateString("en-CA",{
  month: "long",
  day: "numeric",
  year: "numeric",
  
});
  const postdata = {title,textarea,date,pin}
  const token = localStorage.getItem('token')
  const Addnote = async (e) => {
  

    const result = await Swal.fire({
      title: "Add Note?",
      text: "Do you want to save this note?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, add it!",
    });

    if (result.isConfirmed) {

      const response = await axios.post("http://localhost:9000/addnotes",postdata, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
      console.log(response.data);
      if(response.ok){
        settextarea("");
        settitle("");
        
      }
      const nresult = await Swal.fire({
      title: "Add Note?",
      text: "Do you want to save this note?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "rgb(65, 221, 51)",
      confirmButtonText: "see notes",
      cancelButtonText: "add another",
    });
    if(nresult.isDismissed){
      settextarea("");
        settitle("");
    }
    if(nresult.isConfirmed){
      usnavigate("/Notes")
    }

    
    }
  };

  return (
    <div className="addnotes">
      
      <div className="form">
        <div className="submitted">
          <input
            type="text"
            className="title"
            value={title}
            onChange={e=>settitle(e.target.value)}
            placeholder="Enter title"
          />
          
          <button onClick={()=>Addnote()}>ADD</button>
        </div>
          

        <textarea
          name="text"
          value={textarea}
          onChange={e=>settextarea(e.target.value)}
          placeholder="Write your note here..."
        ></textarea>
      </div>
      <button onClick={()=>usnavigate("/Notes")}>Notes</button>
    </div>
  );
};

export default AddNote;