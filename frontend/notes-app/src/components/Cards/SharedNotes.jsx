// frontend/src/components/SharedNotes.js
import React, { useEffect, useState } from "react";

const SharedNotes = () => {
  const [sharedNotes, setSharedNotes] = useState([]);

  useEffect(() => {
    const fetchSharedNotes = async () => {
      try {
        const response = await fetch("/api/notes/shared-with-me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const data = await response.json();
        setSharedNotes(data.sharedNotes);
      } catch (error) {
        console.error("Error fetching shared notes:", error);
      }
    };

    fetchSharedNotes();
  }, []);

  return (
    <div>
      <h2>Notes Shared with Me</h2>
      {sharedNotes.map((note) => (
        <div key={note._id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
        </div>
      ))}
    </div>
  );
};

export default SharedNotes;
