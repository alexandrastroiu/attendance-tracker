<?php
// Returns a list of sessions for the selected course in JSON format.

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start();

try {
    // Validate user is logged in
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

    // Validate logged in user is a teacher
    if (!$teacher) {
        echo json_encode(["error" => "Teacher not found"]);
        exit;
    }

    $teacher_id = $teacher["teacher_id"];

    // GET request
    $course_id = isset($_GET["course_id"]) ? intval($_GET["course_id"]) : null;

    // Validate course was selected
    if (!$course_id) {
        echo json_encode(["error" => "Course ID is required"]);
        exit;
    }

    // Query to fetch courses for logged in teacher
    $courseCheck = $conn->prepare("
SELECT course_name, course_id
FROM Courses
Where course_id = :course_id AND teacher_id = :teacher_id
");

    $courseCheck->bindParam(":course_id", $course_id);
    $courseCheck->bindParam(":teacher_id", $teacher_id);

    $courseCheck->execute();

    $course = $courseCheck->fetch(PDO::FETCH_ASSOC);

    // Validate logged in user teaches the selected course
    if (!$course) {
        echo json_encode(["error" => "Unauthorized: You do not teach this course"]);
        exit;
    }

    // Query to fetch sessions for the selected course (sessions until current date)
    $sessionsQuery = $conn->prepare("
SELECT session_id, session_date
FROM Course_Sessions
WHERE course_id = :course_id
AND DATE(session_date) <= CURDATE()
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
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
