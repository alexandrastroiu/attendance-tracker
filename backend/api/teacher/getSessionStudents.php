<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start();

try{
// Validate user
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$user_id = intval($_SESSION["user_id"]);
$session_id = isset($_GET["session_id"]) ? intval($_GET["session_id"]) : null;

if (!$session_id) {
    echo json_encode(["error"=> "Session is required"]);
    exit;
}

$teacherQuery = $conn->prepare("
SELECT teacher_id
FROM Teachers
WHERE user_id = :user_id
");
$teacherQuery->bindParam(":user_id", $user_id);
$teacherQuery->execute();
$teacher = $teacherQuery->fetch(PDO::FETCH_ASSOC);

if (!$teacher) {
    echo json_encode(["error"=> "Teacher not found"]);
    exit;
}

$teacher_id = $teacher["teacher_id"];

$checkSession = $conn->prepare("
SELECT C.course_id
FROM Course_Sessions CS
JOIN Courses C ON C.course_id = CS.course_id
WHERE CS.session_id = :session_id AND C.teacher_id = :teacher_id
");
$checkSession->bindParam(":teacher_id", $teacher_id);
$checkSession->bindParam(":session_id", $session_id);
$checkSession->execute();

if (!$checkSession->fetch()) {
    echo json_encode(["error" => "Invalid session for selected course"]);
    exit;
}

// Query to fetch enrolled students and attendance
$studentsQuery = $conn->prepare("
SELECT S.student_id,
CONCAT(S.first_name, ' ', S.last_name) as student_name,
A.attendance_status,
CE.enrollment_type
FROM Course_Enrollment CE
JOIN Students S on S.student_id = CE.student_id 
LEFT JOIN Attendance A 
ON A.student_id = CE.student_id
AND A.session_id = :session_id
WHERE CE.course_id = (SELECT course_id FROM Course_Sessions WHERE session_id = :session_id)
ORDER BY S.last_name
");
$studentsQuery->bindParam(":session_id", $session_id);
$studentsQuery->execute();
$students = $studentsQuery->fetchAll(PDO::FETCH_ASSOC);

if (!$students) $students = [];

echo json_encode($students);
}
catch (Exception $e) {
    echo json_encode(["error"=> $e->getMessage()]);
}
?>