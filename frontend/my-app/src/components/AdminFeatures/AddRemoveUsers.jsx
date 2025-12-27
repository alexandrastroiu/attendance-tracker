import React, { useEffect, useState } from "react";
import "./Users.css";
import Navbar from "../NavigationBar/Navbar";

const BASE_URL =
  "http://localhost:8888/management_attendance/attendance-tracker/backend/api/admin/users";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandAdd, setExpandAdd] = useState(false);
  const [expandDelete, setExpandDelete] = useState(false);
  const [expandView, setExpandView] = useState(false);

  const initialUserState = {
    username: "",
    user_email: "",
    password: "",
    user_role: "student",
    group_id: "",
    department_id: "",
    first_name: "",
    last_name: "",
  };

  const [newUser, setNewUser] = useState(initialUserState);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [U, G, D] = await Promise.all([
          fetch(`${BASE_URL}/getUsers.php`, { credentials: "include" }),
          fetch(`${BASE_URL}/getGroups.php`, { credentials: "include" }),
          fetch(`${BASE_URL}/getDepartments.php`, { credentials: "include" }),
        ]);

        setUsers(await U.json());
        setGroups(await G.json());
        setDepartments(await D.json());
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch(`${BASE_URL}/getUsers.php`, {
      credentials: "include",
    });
    setUsers(await res.json());
  };

  const handleChange = (e) => {
    setNewUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddUser = async () => {
    if (
      !newUser.username.trim() ||
      !newUser.user_email.trim() ||
      !newUser.password.trim()
    ) {
      alert("Username, Email and Password are required");
      return;
    }

    if (
      (newUser.user_role === "teacher" || newUser.user_role === "student") &&
      !newUser.first_name.trim()
    ) {
      alert("First name is required");
      return;
    }

    let payload = { ...newUser };

    if (newUser.user_role === "admin") {
      payload.first_name = "";
      payload.last_name = "";
      payload.group_id = "";
      payload.department_id = "";
    }
    if (newUser.user_role === "student") {
      payload.department_id = "";
    }
    if (newUser.user_role === "teacher") {
      payload.group_id = "";
    }

    try {
      const res = await fetch(`${BASE_URL}/addUser.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        alert("User created successfully");
        fetchUsers();

        setNewUser(initialUserState);

        setExpandAdd(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error creating user");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${BASE_URL}/deleteUser.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("User deleted");
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error deleting user");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading users...</p>;
  if (error)
    return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

  return (
    <div className="users-page">
      <Navbar />
      <div className="users-card">
        <h1 className="users-header">Manage Users</h1>

        <div className="users-section">
          <button
            className="users-btn"
            onClick={() => setExpandAdd(!expandAdd)}
          >
            Add User
          </button>

          {expandAdd && (
            <div className="users-form">
              <input
                name="username"
                value={newUser.username}
                placeholder="Username"
                onChange={handleChange}
              />
              <input
                name="user_email"
                value={newUser.user_email}
                placeholder="Email"
                onChange={handleChange}
              />
              <input
                name="password"
                value={newUser.password}
                type="password"
                placeholder="Password"
                onChange={handleChange}
              />

              <select
                name="user_role"
                value={newUser.user_role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>

              {(newUser.user_role === "student" ||
                newUser.user_role === "teacher") && (
                <>
                  <input
                    name="first_name"
                    value={newUser.first_name}
                    placeholder="First Name"
                    onChange={handleChange}
                  />
                  <input
                    name="last_name"
                    value={newUser.last_name}
                    placeholder="Last Name"
                    onChange={handleChange}
                  />
                </>
              )}

              {newUser.user_role === "student" && (
                <select
                  name="group_id"
                  value={newUser.group_id}
                  onChange={handleChange}
                >
                  <option value="">Select Group</option>
                  {groups.map((g) => (
                    <option key={g.group_id} value={g.group_id}>
                      {g.group_name}
                    </option>
                  ))}
                </select>
              )}

              {newUser.user_role === "teacher" && (
                <select
                  name="department_id"
                  value={newUser.department_id}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.department_id} value={d.department_id}>
                      {d.department_name}
                    </option>
                  ))}
                </select>
              )}

              <button className="users-submit" onClick={handleAddUser}>
                Submit
              </button>
            </div>
          )}
        </div>

        <div className="users-section">
          <button
            className="users-btn"
            onClick={() => setExpandDelete(!expandDelete)}
          >
            Delete User
          </button>

          {expandDelete && (
            <ul className="users-delete-list">
              {users.map((u) => (
                <li key={u.user_id}>
                  {u.username} ({u.user_role})
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteUser(u.user_id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="users-section">
          <button
            className="users-btn"
            onClick={() => setExpandView(!expandView)}
          >
            View Users
          </button>

          {expandView && (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id}>
                      <td>{u.username}</td>
                      <td>{u.user_email}</td>
                      <td>{u.user_role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
