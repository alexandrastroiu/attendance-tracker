<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start();

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["error" => "Notlogged in"]);
        exit;
    }

    $user_id = intval($_SESSION["user_id"]);

    $teacherQuery = $conn->prepare("
SELECT teacher_id FROM Teachers WHERE user_id = :user_id LIMIT 1
");
    $teacherQuery->bindParam(":user_id", $user_id);
    $teacherQuery->execute();
    $teacher = $teacherQuery->fetch(PDO::FETCH_ASSOC);

    if (!$teacher) {
        echo json_encode(["error" => "Teacher not found"]);
        exit;
    }

    $teacher_id = $teacher["teacher_id"];

    // Query to fetch all courses for logged in teacher, with the number of enrolled stduents and number of sessions per semester
    $teacherCoursesQuery = $conn->prepare("
SELECT C.course_id, C.course_name, C.course_type, 
(SELECT COUNT(*) FROM Course_Enrollment CE
WHERE CE.course_id = C.course_id) AS enrolled_students,
(SELECT COUNT(*) FROM Course_Sessions CS
WHERE CS.course_id = C.course_id
AND CS.session_date BETWEEN '2025-09-01' AND '2026-02-01') AS sessions_per_semester
FROM Courses C
WHERE C.teacher_id = :teacher_id
");
    $teacherCoursesQuery->bindParam(":teacher_id", $teacher_id, PDO::PARAM_INT);
    $teacherCoursesQuery->execute();
    $teacherCourses = $teacherCoursesQuery->fetchAll(PDO::FETCH_ASSOC);

    if (!$teacherCourses) {
        echo json_encode(["error" => "No courses found"]);
        exit;
    }

    echo json_encode($teacherCourses);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>