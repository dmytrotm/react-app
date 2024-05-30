import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import { MdAdd, MdClose } from "react-icons/md";
import Modal from "react-modal";
import AddEditNotes from "./AddEditNotes";
import Toast from "../../components/ToastMessage/Toast";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import AddNotesImg from "../../assets/images/add-notes.svg";
import NoDataImg from "../../assets/images/no-data.svg";
import EmptyCard from "../../components/EmptyCard/EmptyCard";

const Home = () => {
  const [allNotes, setAllNotes] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });
  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });
  const [shareModal, setShareModal] = useState({
    isShown: false,
    noteId: null,
  });
  const [shareUserId, setShareUserId] = useState("");

  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message: message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");

      if (response.data && response.data.notes) {
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const deleteNote = async (data) => {
    const noteId = data._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);

      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    }
  };

  const onSearchNote = async (query) => {
    try {
      const response = await axiosInstance.get("/search-notes", {
        params: { query },
      });

      if (response.data && response.data.notes) {
        setIsSearch(true);
        setAllNotes(response.data.notes);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;

    try {
      const response = await axiosInstance.put(
        "/update-note-pinned/" + noteId,
        {
          isPinned: !noteData.isPinned,
        }
      );

      if (response.data && response.data.note) {
        showToastMessage("Note Updated Successfully", "update");
        getAllNotes();
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  const handleClearSearch = () => {
    setIsSearch(false);
    getAllNotes();
  };

  const handleShareNote = (noteId) => {
    setShareModal({ isShown: true, noteId });
  };

  const shareNote = async () => {
    try {
      const response = await axiosInstance.post("/share-note", {
        noteId: shareModal.noteId,
        userId: shareUserId,
      });

      if (response.data && !response.data.error) {
        showToastMessage("Note Shared Successfully", "share");

        // Update the shared note in the state
        setAllNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === shareModal.noteId
              ? {
                  ...note,
                  shared: true,
                  sharedWith: [...note.sharedWith, shareUserId],
                  tags: [...note.tags, `SharedBy${userInfo.fullName}`],
                }
              : note
          )
        );

        setShareModal({ isShown: false, noteId: null });
        setShareUserId("");
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {};
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto">
        {isSearch && (
          <h3 className="text-lg font-medium mt-5">Search Results</h3>
        )}

        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mt-8">
            {allNotes.map((item) => {
              return (
                <NoteCard
                  key={item._id}
                  title={item.title}
                  content={item.content}
                  date={item.createdOn}
                  tags={item.tags}
                  isPinned={item.isPinned}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => deleteNote(item)}
                  onPinNote={() => updateIsPinned(item)}
                  onShare={() => handleShareNote(item._id)}
                  userInfo={userInfo} // Pass userInfo as a prop
                  noteUserId={item.userId} // Pass note.userId as a prop
                />
              );
            })}
          </div>
        ) : (
          <EmptyCard
            imgSrc={isSearch ? NoDataImg : AddNotesImg}
            message={
              isSearch
                ? `Oops! No notes found matching your search.`
                : `Start creating your first note! Click the 'Add' button to jot down your
          thoughts, ideas, and reminders. Let's get started!`
            }
          />
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: "add", data: null })
        }
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel="Add/Edit Note"
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <AddEditNotes
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenAddEditModal({ isShown: false, type: "add", data: null });
          }}
          showToastMessage={showToastMessage}
          getAllNotes={getAllNotes}
        />
      </Modal>

      <Modal
        isOpen={shareModal.isShown}
        onRequestClose={() => setShareModal({ isShown: false, noteId: null })}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel="Share Note"
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
      >
        <div className="relative">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-50"
            onClick={() => setShareModal({ isShown: false, noteId: null })}
          >
            <MdClose className="text-xl text-slate-400" />
          </button>

          <h2 className="text-lg font-medium mb-4">Share Note</h2>
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Enter email"
            value={shareUserId}
            onChange={(e) => setShareUserId(e.target.value)}
          />
          <button
            className="btn-primary font-medium mt-5 p-3"
            onClick={shareNote}
          >
            Share
          </button>
        </div>
      </Modal>
      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
