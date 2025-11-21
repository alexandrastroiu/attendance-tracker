import React, { useEffect, useState } from "react";
import "./Profile.css";
import userIcon from "../assets/person.png"; // round user icon

const Profile = () => {
  const [profile, setProfile] = useState(null);
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
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading profile:", err);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div className="profile-container">Loading...</div>;
  if (!profile) return <div className="profile-container">No profile found.</div>;

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

        <h2 className="profile-name">{profile.full_name}</h2>
        <p className="profile-role">
          Role: <span>{profile.role}</span>
        </p>

        <div className="profile-info">
          <div className="profile-row">
            <span className="label">Username:</span>
            <span>{profile.username}</span>
          </div>

          {/* STUDENT INFO */}
          {profile.role === "student" && (
            <>
              <div className="profile-row">
                <span className="label">Group:</span>
                <span>{profile.group_name}</span>
              </div>
            </>
          )}

          {/* TEACHER INFO */}
          {profile.role === "teacher" && (
            <>
              <div className="profile-row">
                <span className="label">Department:</span>
                <span>{profile.department_name}</span>
              </div>
            </>
          )}

          {/* ADMIN INFO */}
          {profile.role === "admin" && (
            <>
              <div className="profile-row">
                <span className="label">Admin Level:</span>
                <span>{profile.admin_level}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
