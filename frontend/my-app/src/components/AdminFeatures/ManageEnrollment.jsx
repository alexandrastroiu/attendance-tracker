import React, { useEffect, useState } from 'react';
import './Users.css';

const BASE_URL = 'http://localhost:8888/management_attendance/attendance-tracker/backend/api/admin/enrollment';
const BASE_URL_COURSES = 'http://localhost:8888/management_attendance/attendance-tracker/backend/api/admin/courses';

const ManageEnrollments = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandAdd, setExpandAdd] = useState(false);
  const [expandEdit, setExpandEdit] = useState(false);
  const [expandDelete, setExpandDelete] = useState(false);
  const [expandView, setExpandView] = useState(false);

  const initialForm = {
    student_id: '',
    course_id: '',
    enrollment_type: '',
    old_student_id: null,
    old_course_id: null,
  };
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [studentRes, courseRes, enrollmentRes] = await Promise.all([
          fetch(`${BASE_URL}/getUsers.php`, { credentials: 'include' }),
          fetch(`${BASE_URL_COURSES}/getCourses.php`, { credentials: 'include' }),
          fetch(`${BASE_URL}/getEnrollments.php`, { credentials: 'include' }),
        ]);

        setStudents(await studentRes.json());
        setCourses(await courseRes.json());
        setEnrollments(await enrollmentRes.json());
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const fetchEnrollments = async () => {
    const res = await fetch(`${BASE_URL}/getEnrollments.php`, { credentials: 'include' });
    const data = await res.json();
    setEnrollments(Array.isArray(data) ? data : []);
  };

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = async () => {
    if (!form.student_id || !form.course_id || !form.enrollment_type) {
      alert('All fields are required');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/addEnrollment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert('Enrollment added');
        fetchEnrollments();
        setForm(initialForm);
        setExpandAdd(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error adding enrollment');
    }
  };

  const handleEdit = async () => {
    if (!form.enrollment_type) {
      alert('Enrollment type is required');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/editEnrollment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        alert('Enrollment updated');
        fetchEnrollments();
        setForm(initialForm);
        setExpandEdit(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error editing enrollment');
    }
  };

  const handleDelete = async (student_id, course_id) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) return;
    try {
      const res = await fetch(`${BASE_URL}/deleteEnrollment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ student_id, course_id }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Enrollment deleted');
        fetchEnrollments();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error deleting enrollment');
    }
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;

  return (
    <div className="users-page">
      <div className="users-card">
        <h1 className="users-header">Manage Enrollments</h1>

        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandAdd(!expandAdd)}>Add Enrollment</button>
          {expandAdd && (
            <div className="users-form">
              <select name="student_id" value={form.student_id} onChange={handleChange}>
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.user_id} value={s.user_id}>{s.student_name}</option>
                ))}
              </select>

              <select name="course_id" value={form.course_id} onChange={handleChange}>
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                ))}
              </select>

              <select name="enrollment_type" value={form.enrollment_type} onChange={handleChange}>
                <option value="">Select Type</option>
                <option value="active">Active</option>
                <option value="repetition">Repetition</option>
              </select>

              <button className="users-submit" onClick={handleAdd}>Submit</button>
            </div>
          )}
        </div>

        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandEdit(!expandEdit)}>Edit Enrollment</button>
          {expandEdit && (
            <div className="users-table-wrapper">

              <table className="users-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Type</th>
                    <th >Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={`${e.student_id}-${e.course_id}`}>
                      <td>{e.student_name}</td>
                      <td>{e.course_name}</td>
                      <td>{e.enrollment_type}</td>
                      <td>
                        <button className="users-btn" id='edit'
                          onClick={() => setForm({
                            student_id: e.student_id,
                            course_id: e.course_id,
                            enrollment_type: e.enrollment_type,
                            old_student_id: e.student_id,
                            old_course_id: e.course_id
                          })}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {form.old_student_id && form.old_course_id && (
                <div className="users-form" style={{ marginTop: '20px' }}>
                  <label>Edit Enrollment Type:</label>
                  <select name="enrollment_type" value={form.enrollment_type} onChange={handleChange}>
                    <option value="">Select Type</option>
                    <option value="active">Active</option>
                    <option value="repetition">Repetition</option>
                  </select>
                  <button className="users-submit" onClick={handleEdit}>Submit</button>
                </div>
              )}

            </div>
          )}
        </div>

        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandDelete(!expandDelete)}>Delete Enrollment</button>
          {expandDelete && (
            <ul className="users-delete-list">
              {enrollments.map(e => (
                <li key={`${e.student_id}-${e.course_id}`}>
                  {e.student_name} - {e.course_name} ({e.enrollment_type})
                  <button className="delete-btn" onClick={() => handleDelete(e.student_id, e.course_id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandView(!expandView)}>View Enrollments</button>
          {expandView && (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Enrollment Type</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={`${e.student_id}-${e.course_id}`}>
                      <td>{e.student_name}</td>
                      <td>{e.course_name}</td>
                      <td>{e.enrollment_type}</td>
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

export default ManageEnrollments;
