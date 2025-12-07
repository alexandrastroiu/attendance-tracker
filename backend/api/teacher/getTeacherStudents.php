<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start();

// Verify if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$user_id = intval($_SESSION["user_id"]);

$teacherQuery = $conn->prepare("
SELECT teacher_id
FROM Teachers
WHERE user_id = :user_id
");
$teacherQuery->bindParam(":user_id", $user_id);
$teacherQuery->execute();
$teacher = $teacherQuery->fetch(PDO::FETCH_ASSOC);

// Validate teacher
if (!$teacher) {
    echo json_encode(["error" => "Teacher not found"]);
    exit;
}

$teacher_id = $teacher["teacher_id"];

// Get students enrolled in any course taught by logged in teacher
$getStudents = $conn->prepare("
SELECT S.student_id,
CONCAT(S.first_name, ' ', S.last_name) AS student_name
FROM Students S
WHERE S.student_id IN (
SELECT CE.student_id
FROM Course_Enrollment CE
JOIN Courses C ON C.course_id = CE.course_id
WHERE C.teacher_id = :teacher_id
)
ORDER BY student_name
");

$getStudents->bindParam(":teacher_id", $teacher_id, PDO::PARAM_INT);
$getStudents->execute();
$students = $getStudents->fetchAll(PDO::FETCH_ASSOC);

if (!$students) {
    echo json_encode(["error" => "No students found"]);
    exit;
}

// JSON output
echo json_encode($students);
?>