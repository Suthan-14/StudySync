import  { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router';
import './one.css'

const OneNote = () => {

    const {id} = useParams();
    const navigate = useNavigate();
 const token = localStorage.getItem("token");

    const [note,setnote] = useState({});

   async function getNote(){

        try {
            
            let response = await fetch(`http://localhost:9000/notes/${id}`,{
                     method: "GET",
        headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    }
            });
            if(!response.ok){
                throw new Error('Faild to fetch')
            }
            let data = await response.json();
            setnote(data);

        } catch (error) {
            
            console.log(error);
            
        }
    }

    useEffect(()=>{
        getNote(id);
    },[id])




  return (
    <>
     
  <div key={note.id}>
    <h3 id="top">{note.title}</h3>
    <p  style={{
    whiteSpace: "pre-wrap"
  }}>{note.textarea}</p>
  </div>

  <button onClick={()=>navigate("/Notes")}>Go Back</button>
  <button><a href="#top">Back to Top ↑</a></button>

    </>
  )
}

export default OneNote