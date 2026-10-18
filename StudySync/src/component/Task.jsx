import React, { useEffect, useState } from "react";
import "./task.css";
import Swal from "sweetalert2";
import { FcCheckmark } from "react-icons/fc";

function Task() {
  const [loading,setLoading] = useState(true);
  const [id, setid] = useState("");
  const [user, setuser] = useState([]);
  const date = new Date().toLocaleDateString("en-CA");
  const [err,seterr] = useState("")
  const [search,setsearch] = useState("");
  const [Ndata,setNdata] = useState({
    task:"",
    label:"",
    status:"Incomplete",
    priority:"",
    startDate:"",
    dueDate:"",
    completed:"",

  });
  const [pop, setpop] = useState(true);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [del,setdel] = useState(true)
  const [put, setput] = useState({
    task: "",
    label: "",
    status: "",
    startDate:"",
  });
  const [add,setadd] = useState(true);
  const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3
};
 const token = localStorage.getItem("token");

  function getNextId() {
  if (user.length === 0) {
    return 1;
  }

  const maxId = Math.max(...user.map((task) => Number(task.id)));

  return maxId + 1;
}

async function fetchTasks() {

    setLoading(true)

    try{

      const res = await fetch("http://localhost:9000/gettask",{
            method: "GET",
        headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    }
      });
      const data = await res.json();

     
      const sortedData = [...data].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      setuser(sortedData);
    
      
      if(!res.ok){
        throw new  Error("Failed to fetch tasks");
      }

    }
    catch(err){
        console.error("Failed to fetch the data ..",err); 
        
    }

    finally{
      setLoading(false)
    }
   
    
}



  useEffect(() => {
     fetchTasks();
   
  }, []);


  useEffect(() => {
    if (!pop) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "auto";
    }

    return () => {
        document.body.style.overflow = "auto";
    };
}, [pop]);

function handleadd(e){

  setNdata({...Ndata,
    [e.target.name]:e.target.value,
    id:getNextId(),
    startDate:date,
  })

 
  

}


async function Add(){


  if(Ndata.task.trim() === ""){
    seterr("Please enter the task..");
  }
  else if(Ndata.label === ""){

       seterr("Please choose the label..");
  }
  else if(Ndata.priority === ""){

       seterr("Please set priority..");
  }

  else{

     
      
      seterr("")
       setLoading(true)

    try{
       const ad = await fetch("http://localhost:9000/addtask",{
        
          method:"POST",
          headers: {
                "Content-Type": "application/json",
                "Authorization":`Bearer ${token}`
              },
          body:JSON.stringify(Ndata)
      
        });

          setNdata({
            task:"",
            label:"",
            status:"Incomplete",
            priority:"",
            startDate:date,
            dueDate:"",
            completed:"",
          })

          setadd(!add);
          await fetchTasks();
          const data = ad.json();
          console.log(data);
          
      if(!ad.ok){
        throw new  Error("Failed to fetch tasks");
      }

    }
    catch(err){
        console.console.error("Failed to fetch the data ..",err); 
        
    }

    finally{
      setLoading(false)
    }

     
}

}

  function Edit(id) {
    const updata = user.find((data) => data._id === id);

    setput((prev) => ({
      ...prev,
      ...updata,
    }));

    setid(id);
  }

  function handle(e) {
    const { name, value } = e.target;

    setput((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

async function save() {
    setLoading(true);

    try {
        const res = await fetch(`http://localhost:9000/update/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                ...put
               
            })
        });

        const data = await res.json();

        console.log("Status:", res.status);
        console.log("Backend response:", data.task);

        if (!res.ok) {
            throw new Error(data.error || data.message || "Update failed");
        }

        setput({
            task: "",
            label: "",
            status: "",
            startDate: ""
        });

        await fetchTasks();
        setpop(true);

    } catch (err) {
        console.error("Failed to update:", err);
    } finally {
        setLoading(false);
    }
}

async function completed(id) {
  const response = await fetch(`http://localhost:9000/update/${id}`,{
    method:"PATCH",
    headers:{
       "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    },
    body:JSON.stringify({
      status:"Complete",
       completed: date
    })
  })
   fetchTasks();
}


  async function deleteTask(id){
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      await fetch(`http://localhost:9000/delete/${id}`, {
        method: "DELETE",
        headers: {
                    "Authorization": `Bearer ${token}`
                },
      });

      await fetchTasks();

      Swal.fire({
        title: "Deleted!",
        text: "Task has been deleted.",
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete task.",
        icon: "error",
      });
    }
     fetchTasks();
  }
};

  function searchTask(){

    const filter = search.trim() === "" ? user : user.filter((data,index)=>{

      return(
      data.id === Number(search)  ||
      data.task.toLowerCase().includes(search.toLocaleLowerCase())   

      )

     

    });
    setFilteredTasks(filter);

}



  return (
    <>
          {loading && (
      <div className="loader-overlay">
        <div className="spinner"></div>
      </div>
    )}
      {/* Blur Overlay */}
      {!pop && <div className="blur-overlay"></div>}
      {!add && <div className="blur-overlay"></div>}
      <div className="sebar">
      <div>
      <input
          type="search"
          placeholder="search task here ..."
          value={search}
          onChange={(e) => {
            const value = e.target.value;
          
            setsearch(value);
            searchTask();
          
           
            if (value.trim() === "") {
              setFilteredTasks(user);
            }
          }}

          onKeyDown={(e) => {
             if (e.key === "Enter") {
               searchTask();
             }
          }}
        />

        <button onClick={searchTask}>Search</button>
        </div>

        <button onClick={()=>{setadd(!add)
          
        }}>Add task</button>
      </div>

      <div className="table-container">
         <div className={`edit-popup ${add ? "add" : ""}`}>
          <h2>Add Task</h2>
          <span>enter task</span>
          <input
            type="text"
            value={Ndata.task}
            name="task"
            placeholder="Enter the task..."
            onChange={handleadd}
          /> 
          {err !== ""&& Ndata.task ==="" &&<span className="error">{err}</span>}
          
          
          

          <label>How do you want to achieve it?</label>

      <select
        name="label"
        value={Ndata.label}
        onChange={(e) => {
         
          handleadd(e);
        }}
      >
         <option value="">Select a label</option>
         <option value="study">Study</option>
         <option value="assignment">Assignment</option>
         <option value="exam">Exam Preparation</option>
         <option value="project">Project</option>
         <option value="revision">Revision</option>
         <option value="personal">Personal</option>
      </select>
      {err !== ""&& Ndata.label ==="" &&<span className="error">{err}</span>}

      
      <span>set preority</span>
      <select
  name="priority"
  value={Ndata.priority}
  onChange={(e) => {
          handleadd(e);
        }}

  
>
  <option value="" >
    Select priority
  </option>

  <option value="low" className="bg-success text-white">
    Low
  </option>

  <option value="medium" className="bg-warning text-dark">
    Medium
  </option>

  <option value="high" className="bg-danger text-white">
    High
  </option>
</select>
{err !== ""&& Ndata.priority ==="" &&<span className="error">{err}</span>}

  <label>Set due date</label>
          <input
            type="date"
            value={Ndata.dueDate}
            name="dueDate"
            placeholder="Enter the task..."
            onChange={handleadd}
          /> 

        

          <div className="popup-buttons">
            <button
              className="cancel"
              onClick={() => {
                setadd(!add);
              }}
            >
              Cancel
            </button>

            <button className="save" onClick={Add}>
              Add
            </button>
          </div>
        </div>
        <div className={`edit-popup ${pop ? "dis" : ""}`}>
          <h2>Edit Task</h2>

          <input
            type="text"
            name="task"
            value={put.task}
            placeholder="Task"
            onChange={handle}
          />

          <input
            type="text"
            name="label"
            value={put.label}
            placeholder="Label"
            onChange={handle}
          />

          
      <select
        name="status"
        value={put.status}
        onChange={handle}
      >
         <option value={put.status}>{put.status}</option>
        
        {put.status ==="Complete" || <option value="Complete">Complete</option>} 
        {put.status ==="Pending" || <option value="In Progrss">Pendings</option>} 
        
         
      </select>

         

          <div className="popup-buttons">
            <button
              className="cancel"
              onClick={() => {
                setpop(true);
              }}
            >
              Cancel
            </button>

            <button className="save" onClick={save}>
              Save
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Task</th>
              <th>Label</th>
              <th>Status</th>
              <th>priority</th>
              <th>start Date</th>
              <th>Due Date</th>
              <th>Completed</th>
              <th>Update</th>
            </tr>
          </thead>
   


         <tbody>
        
  {(filteredTasks.length > 0 || search.trim() !== "" ? filteredTasks : user).map(
    (data, index) => (
      <tr key={data._id}>
        <td>{index + 1}</td>
        <td>{data.task}</td>
        <td>{data.label}</td>
        <td>{data.status}</td>
        <td ><span className={data.priority}>{data.priority}</span></td>
        <td>{new Date(data.startDate).toLocaleDateString("en-CA")}</td>
        <td>{new Date(data.dueDate).toLocaleDateString("en-CA")}</td>
        <td><button className="complete" onClick={()=>completed(data._id)}><FcCheckmark /></button></td>
        <td>
          <button
            className="edit"
            onClick={() => {
              Edit(data._id);
              setpop(false);
              setadd(true);
            }}
          >
            Edit
          </button>

          <button onClick={() => deleteTask(data._id)}>Delete</button>
        </td>
      </tr>
    )
  )}
 
</tbody>
        </table>
      </div>
    </>
  );
}

export default Task;