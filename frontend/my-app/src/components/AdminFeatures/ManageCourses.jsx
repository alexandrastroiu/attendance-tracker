import React, { useEffect, useState } from 'react';
import './Users.css';

const BASE_URL = 'http://localhost:8888/management_attendance/attendance-tracker/backend/api/admin/courses';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [expandAdd, setExpandAdd] = useState(false);
  const [expandEdit, setExpandEdit] = useState(false);
  const [expandDelete, setExpandDelete] = useState(false);
  const [expandView, setExpandView] = useState(false);

  const initialCourseState = {
    course_name: '',
    course_type: '',
    teacher_id: '',
    course_id: null, 
  };
  
  const [courseForm, setCourseForm] = useState(initialCourseState);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [courseRes, teacherRes] = await Promise.all([
          fetch(`${BASE_URL}/getCourses.php`, { credentials: 'include' }),
          fetch(`${BASE_URL}/getTeachers.php`, { credentials: 'include' }),
        ]);

        const courseData = await courseRes.json();
        const teacherData = await teacherRes.json();

        setCourses(Array.isArray(courseData) ? courseData : []);
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const fetchCourses = async () => {
    const res = await fetch(`${BASE_URL}/getCourses.php`, { credentials: 'include' });
    const data = await res.json();
    setCourses(Array.isArray(data) ? data : []);
  };

  const handleChange = e => {
    setCourseForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddCourse = async () => {
    if (!courseForm.course_name.trim() || !courseForm.course_type || !courseForm.teacher_id) {
      alert('All fields are required');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/addCourse.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (data.success) {
        alert('Course added successfully');
        fetchCourses();
        setCourseForm(initialCourseState);
        setExpandAdd(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error adding course');
    }
  };

  const handleEditCourse = async () => {
    if (!courseForm.course_name.trim() || !courseForm.course_type || !courseForm.teacher_id) {
      alert('All fields are required');
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/editCourse.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(courseForm),
      });
      const data = await res.json();
      if (data.success) {
        alert('Course updated successfully');
        fetchCourses();
        setCourseForm(initialCourseState);
        setExpandEdit(false);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error editing course');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`${BASE_URL}/deleteCourse.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ course_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Course deleted');
        fetchCourses();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error deleting course');
    }
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading courses...</p>;
  if (error) return <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>;

  return (
    <div className="users-page">
      <div className="users-card">
        <h1 className="users-header">Manage Courses</h1>

        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandAdd(!expandAdd)}>Add Course</button>
          {expandAdd && (
            <div className="users-form">
              <input name="course_name" value={courseForm.course_name} placeholder="Course Name" onChange={handleChange} />

              <select name="course_type" value={courseForm.course_type} onChange={handleChange}>
                <option value="">Select Course Type</option>
                <option value="Mandatory">Mandatory</option>
                <option value="Elective">Elective</option>
                <option value="Optional">Optional</option>
              </select>

              <select name="teacher_id" value={courseForm.teacher_id} onChange={handleChange}>
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t.user_id} value={t.user_id}>{t.teacher_name}</option>
                ))}
              </select>

              <button className="users-submit" onClick={handleAddCourse}>Submit</button>
            </div>
          )}
        </div>

        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandEdit(!expandEdit)}>Edit Course</button>
          {expandEdit && (
            <div className="users-form">
              <select
                name="course_id"
                value={courseForm.course_id || ''}
                onChange={e => {
                  const selected = courses.find(c => c.course_id === parseInt(e.target.value));
                  setCourseForm({
                    course_id: selected.course_id,
                    course_name: selected.course_name,
                    course_type: selected.course_type,
                    teacher_id: selected.teacher_id,
                  });
                }}
              >
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.course_id} value={c.course_id}>{c.course_name} ({c.course_type})</option>
                ))}
              </select>
              {courseForm.course_id && (
                <>
                  <input name="course_name" value={courseForm.course_name} placeholder="Course Name" onChange={handleChange} />

                  <select name="course_type" value={courseForm.course_type} onChange={handleChange}>
                    <option value="">Select Course Type</option>
                    <option value="Mandatory">Mandatory</option>
                    <option value="Elective">Elective</option>
                    <option value="Optional">Optional</option>
                  </select>

                  <select name="teacher_id" value={courseForm.teacher_id} onChange={handleChange}>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.user_id} value={t.user_id}>{t.teacher_name}</option>
                    ))}
                  </select>

                  <button className="users-submit" onClick={handleEditCourse}>Submit</button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandDelete(!expandDelete)}>Delete Course</button>
          {expandDelete && (
            <ul className="users-delete-list">
              {courses.map(c => (
                <li key={c.course_id}>
                  {c.course_name} ({c.course_type})
                  <button className="delete-btn" onClick={() => handleDeleteCourse(c.course_id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="users-section">
          <button className="users-btn" onClick={() => setExpandView(!expandView)}>View Courses</button>
          {expandView && (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Course Type</th>
                    <th>Teacher</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.course_id}>
                      <td>{c.course_name}</td>
                      <td>{c.course_type}</td>
                      <td>{c.teacher_name || 'N/A'}</td>
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

export default ManageCourses;
