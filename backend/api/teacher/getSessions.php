<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start();

// Validate user
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Notlogged in"]);
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

// GET request
$course_id = isset($_GET["course_id"]) ? intval($_GET["course_id"]) : null;

// Validate course
if (!$course_id) {
    echo json_encode(["error" => "Course ID is required"]);
    exit;
}

$courseCheck = $conn->prepare("
SELECT course_name, course_id
FROM Courses
Where course_id = :course_id AND teacher_id = :teacher_id
");

$courseCheck->bindParam(":course_id", $course_id);
$courseCheck->bindParam(":teacher_id", $teacher_id);

$courseCheck->execute();

$course = $courseCheck->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    echo json_encode(["error" => "Unauthorized: You do not teach this course"]);
    exit;
}

// Query to fetch sessions for the selected course
$sessionsQuery = $conn->prepare("
SELECT session_id, session_date
FROM Course_Sessions
WHERE course_id = :course_id
ORDER BY session_date ASC
 ");
$sessionsQuery->bindParam(":course_id", $course_id);
$sessionsQuery->execute();
$sessions = $sessionsQuery->fetchAll(PDO::FETCH_ASSOC);

// Handle in case of no sessions found
if (!$sessions) {
    echo json_encode(["error" => "No sessions registered for this course"]);
    exit;
}

echo json_encode(($sessions));
?>