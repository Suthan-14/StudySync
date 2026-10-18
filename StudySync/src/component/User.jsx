
import { useEffect, useRef, useState } from "react";
import {
  FaUser,
  FaEnvelope,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaLinkedin,
  FaInstagram,
  FaGithub,
  FaEnvelopeOpenText,
  FaShieldAlt,
} from "react-icons/fa";
import "./User.css";

const API_URL = "http://localhost:9000";
const MAX_IMAGE_SIZE = 200 * 1024;



const getImageUrl = (image) => {
  if (!image) return "";

  // Base64 image, Google image URL, or selected-file preview
  if (
    image.startsWith("data:") ||
    image.startsWith("blob:") ||
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  // Image stored on the Express server
  return `http://localhost:9000${
    image.startsWith("/") ? image : `/${image}`
  }`;
};



function User() {
  const fileInputRef = useRef(null);
  const previewRef = useRef("");

  const [user, setUser] = useState({
    name: "",
    email: "",
    profileImage: "",
  });

  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const token = localStorage.getItem("token");

  const updatePreview = (imageUrl) => {
    const oldPreview = previewRef.current;

    if (oldPreview.startsWith("blob:")) {
      URL.revokeObjectURL(oldPreview);
    }

    previewRef.current = imageUrl;
    setPreview(imageUrl);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load profile."
          );
        }

        const profileData = data.user;

        const profile = {
          name: profileData.name || "",
          email: profileData.email || "",
          profileImage: profileData.profileImage || "",
        };

        if (cancelled) return;

        setUser(profile);
        setName(profile.name);

        // Initially display the user's existing profile image.
        updatePreview(getImageUrl(profile.profileImage));
      } catch (error) {
        if (!cancelled) {
          setMessage({
            type: "error",
            text: error.message || "Failed to load profile.",
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);

      setMessage({
        type: "error",
        text: "Please log in to view your profile.",
      });
    }

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    return () => {
      if (previewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);


const handleImageChange = (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    setMessage({
      type: "error",
      text: "Choose a JPG, PNG, or WebP image.",
    });
    event.target.value = "";
    return;
  }

  if (file.size > 200 * 1024) {
    setMessage({
      type: "error",
      text: "Your photo must be 200 KB or smaller.",
    });
    event.target.value = "";
    return;
  }

  setSelectedFile(file);
  setPreview(URL.createObjectURL(file));
  setMessage({ type: "", text: "" });
};


  const handleCancel = () => {
    // Restore the original name and saved profile image.
    setName(user.name);
    setSelectedFile(null);

    updatePreview(getImageUrl(user.profileImage));

    setEditing(false);
    setMessage({
      type: "",
      text: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setMessage({
        type: "error",
        text: "Name cannot be empty.",
      });
      return;
    }

    if (!token) {
      setMessage({
        type: "error",
        text: "Please log in again.",
      });
      return;
    }

    try {
      setSaving(true);

      setMessage({
        type: "",
        text: "",
      });

      const formData = new FormData();

      formData.append("name", name.trim());

      if (selectedFile) {
        formData.append("profileImage", selectedFile);
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update profile."
        );
      }

      const updatedProfile = data.user;

      const updatedUser = {
        name: updatedProfile.name || name.trim(),
        email: updatedProfile.email || user.email,
        profileImage:
          updatedProfile.profileImage ?? user.profileImage,
      };

      setUser(updatedUser);
      setName(updatedUser.name);
      setSelectedFile(null);

      // Display the saved image URL after a successful update.
      updatePreview(getImageUrl(updatedUser.profileImage));

      localStorage.setItem("username", updatedUser.name);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setEditing(false);

      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="user-loading">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="user-page">
      <div className="user-page-heading">
        <div>
          <p className="user-eyebrow">STUDYSYNC ACCOUNT</p>
          <h1>My Profile</h1>
          <p className="user-subtitle">
            Manage your personal information and account details.
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`user-message ${message.type}`}
          role="status"
        >
          {message.text}
        </div>
      )}

      <div className="user-profile-grid">
        <section className="user-card user-main-card">
          <div className="user-card-heading">
            <div>
              <h2>Personal Information</h2>
              <p>Keep your profile up to date.</p>
            </div>

            {!editing ? (
              <button
                type="button"
                className="user-edit-btn"
                onClick={() => {
                  setName(user.name);
                  setSelectedFile(null);

                  // Keep the existing image when editing starts.
                  updatePreview(getImageUrl(user.profileImage));

                  setEditing(true);
                  setMessage({
                    type: "",
                    text: "",
                  });
                }}
              >
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <button
                type="button"
                className="user-cancel-btn"
                onClick={handleCancel}
                disabled={saving}
              >
                <FaTimes /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="user-avatar-section">
             
<div className="user-avatar">
  {preview ? (
    <img
      key={preview}
      src={preview}
      alt="Profile"
      onError={(event) => {
        console.error("Profile image failed to load:", preview);
      }}
    />
  ) : (
    <FaUser />
  )}
</div>


              {editing && (
                <>
                  <button
                    type="button"
                    className="user-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={saving}
                  >
                    <FaCamera /> Change Photo
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handleImageChange}
                    disabled={saving}
                  />

                  <span className="user-photo-hint">
                    JPG, PNG or WebP · Maximum 200 KB
                  </span>

                  {selectedFile && (
                    <span className="user-photo-hint">
                      Preview: {selectedFile.name}
                    </span>
                  )}
                </>
              )}

              {!editing && (
                <div className="user-avatar-details">
                  <h3>{user.name}</h3>
                  <span>StudySync Member</span>
                </div>
              )}
            </div>

            <div className="user-form-fields">
              <div className="user-field">
                <label htmlFor="profileName">Full Name</label>

                <div className="user-input-wrap">
                  <FaUser />

                  <input
                    id="profileName"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    disabled={!editing || saving}
                    maxLength={60}
                    required
                  />
                </div>
              </div>

              <div className="user-field">
                <label htmlFor="profileEmail">
                  Email Address
                </label>

                <div className="user-input-wrap">
                  <FaEnvelope />

                  <input
                    id="profileEmail"
                    type="email"
                    value={user.email}
                    disabled
                    readOnly
                  />

                  <FaShieldAlt className="user-verified-icon" />
                </div>

                <span className="user-field-hint">
                  Your registered email cannot be changed here.
                </span>
              </div>
            </div>

            {editing && (
              <div className="user-form-actions">
                <button
                  type="button"
                  className="user-cancel-btn"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="user-save-btn"
                  disabled={saving}
                >
                  <FaSave />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>

        <section className="user-card user-contact-card">
          <div className="user-contact-icon">
            <FaEnvelopeOpenText />
          </div>

          <h2>Need Help?</h2>

          <p>
            Have a question or found an issue with StudySync?
            Feel free to contact the admin.
          </p>

          <a
            className="user-admin-email"
            href="mailto:suthant556@gmail.com"
          >
            <FaEnvelope />
            suthant556@gmail.com
          </a>

          <a
            className="user-contact-btn"
            href="mailto:suthant556@gmail.com?subject=StudySync%20Support"
          >
            Contact Admin
          </a>

          <div className="user-contact-divider" />

          <h3>Follow Us</h3>

          <p className="user-social-subtitle">
            Stay connected with StudySync.
          </p>

          <div className="user-social-links">
            <a
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <FaLinkedin />
            </a>

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              title="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <FaGithub />
            </a>
          </div>

          <p className="user-contact-footer">
            Made for better learning with StudySync.
          </p>
        </section>
      </div>
    </div>
  );
}

export default User;
