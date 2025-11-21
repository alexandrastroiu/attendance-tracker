import React, { useEffect, useState } from "react";
import "./Profile.css";
import userIcon from "../assets/user_profile_icon.png"; // round user icon

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          "http://localhost:8888/management_attendance/attendance-tracker/backend/api/profile/getProfile.php",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await res.json();
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="profile-container">Loading...</div>;
  if (!profileData) return <div className="profile-container">No profile found.</div>;

  const { user, profile } = profileData;
  const fullName = profile?.student_name || profile?.teacher_name || "Admin";
  const role = user?.user_role || "Unknown";

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-card">
        {/* User Icon */}
        <div className="profile-icon-wrapper">
          <img src={userIcon} alt="User Icon" className="profile-icon" />
        </div>

        <h2 className="profile-name">{fullName}</h2>
        <p className="profile-role">
          Role: <span>{role}</span>
        </p>

        <div className="profile-info">
          <div className="profile-row">
            <span className="label">Username:</span>
            <span>{user?.username}</span>
          </div>
          <div className="profile-row">
            <span className="label">Email:</span>
            <span>{user?.user_email}</span>
          </div>

          {/* STUDENT INFO */}
          {role === "student" && (
            <div className="profile-row">
              <span className="label">Group:</span>
              <span>{profile?.group_name}</span>
            </div>
          )}

          {/* TEACHER INFO */}
          {role === "teacher" && (
            <div className="profile-row">
              <span className="label">Department:</span>
              <span>{profile?.department_name}</span>
            </div>
          )}

          {/* ADMIN INFO */}
          {role === "admin" && (
            <div className="profile-row">
              <span className="label">Admin Level:</span>
              <span>{profile?.admin_level || "N/A"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
