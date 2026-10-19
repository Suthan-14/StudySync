
import { useEffect, useState } from "react";
import { FaPaperclip} from "react-icons/fa";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

function Notes() {
  const [notes, setnotes] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setsearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch Notes
  const fetchNotes = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:9000/getnotes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sortedNotes = [...response.data].sort(
        (a, b) => Number(Boolean(b.pin)) - Number(Boolean(a.pin))
      );

      setnotes(sortedNotes);

      const value = search.trim().toLowerCase();

      const filtered = value
        ? sortedNotes.filter(
            (note) =>
              (note.title || "").toLowerCase().includes(value) ||
              (note._id || "").toLowerCase().includes(value)
          )
        : sortedNotes;

      setFilteredTasks(filtered);
    } catch (error) {
      console.error("Failed to fetch notes:", error);

      Swal.fire({
        title: "Error!",
        text: "Unable to fetch notes.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Search Notes
  const searchTask = (value = search, list = notes) => {
    const searchValue = value.trim().toLowerCase();

    const filtered = searchValue
      ? list.filter(
          (note) =>
            (note.title || "").toLowerCase().includes(searchValue) ||
            (note._id || "").toLowerCase().includes(searchValue)
        )
      : list;

    setFilteredTasks(filtered);
  };

  // Handle Search Input
  const handleSearch = (value) => {
    setsearch(value);
    searchTask(value);
  };

  // Delete Note
  async function Delete(id) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `http://localhost:9000/deletenotes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedNotes = notes.filter((note) => note._id !== id);

      setnotes(updatedNotes);
      searchTask(search, updatedNotes);

      await Swal.fire({
        title: "Deleted!",
        text: "Note has been deleted.",
        icon: "success",
      });
    } catch (error) {
      console.error("Failed to delete note:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to delete note.",
        icon: "error",
      });
    }
  }

  // Pin / Unpin Note
  async function Pinnote(note) {
    try {
      const updatedPin = !note.pin;

      await axios.patch(
        `http://localhost:9000/UpPin/${note._id}`,
        {
          pin: updatedPin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedNotes = notes.map((item) =>
        item._id === note._id
          ? { ...item, pin: updatedPin }
          : item
      );

      const sortedNotes = [...updatedNotes].sort(
        (a, b) => Number(Boolean(b.pin)) - Number(Boolean(a.pin))
      );

      setnotes(sortedNotes);
      searchTask(search, sortedNotes);
    } catch (error) {
      console.error("Failed to update pin:", error);

      Swal.fire({
        title: "Error!",
        text: "Unable to pin or unpin this note.",
        icon: "error",
      });
    }
  }

  // Render Notes
  const displayedNotes = search.trim()
    ? filteredTasks
    : notes;

  return (
    <>
      <div className="notesearch">
        <div>
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes by title..."
          />

          <button onClick={() => searchTask()}>
            Search
          </button>
        </div>

        <div className="btnf">
          <button onClick={() => navigate("/New-notes")}>
            Add Notes
          </button>

       
        </div>
      </div>

      <div className="box">
        {loading && notes.length === 0 ? (
          <p>Loading notes...</p>
        ) : displayedNotes.length > 0 ? (
          displayedNotes.map((note) => (
            <div className="note" key={note._id}>
              <div className="header">
                <h4>{note.title}</h4>

                <div className={`infoo ${note.pin ? "showinfo":""}`}>
                  <button
                    type="button"
                    className={`pin ${note.pin ? "pined" : ""}`}
                    onClick={() => Pinnote(note)}
                    title={note.pin ? "Unpin note" : "Pin note"}
                    aria-label={note.pin ? "Unpin note" : "Pin note"}
                  >
                    <FaPaperclip />
                  </button>
                </div>
              </div>

              <p>
                {(note.textarea || "").length > 80
                  ? note.textarea.substring(0, 80) + "..."
                  : note.textarea}
              </p>

              <div className="footer">
                <div>
                  <Link to={`/P-Notes/${note._id}`}>
                    Read more...
                  </Link>

                  <p>
                    <span>Last Edited: </span>
                    {note.date}
                  </p>
                </div>

                <div className="ebtn">
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => navigate(`/Edit/${note._id}`)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => Delete(note._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>
            {search.trim()
              ? "No matching notes found."
              : "No notes available. Add a new note!"}
          </p>
        )}
      </div>
    </>
  );
}

export default Notes;
