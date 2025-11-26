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

$user_is = intval($_SESSION["user_id"]);

// Fetch POST data
$data = json_decode(file_get_contents("php://input"), true);

$session_id = $data["session_id"];
$attendance = $data["attendance"];

if (!$session_id || $attendance) {
    echo json_encode(["error"=> "Session ID or attendance data missing"]);
    exit;
}

$teacherQuery = $conn->prepare("
SELECT teacher_id
FROM Teachers
WHERE user_id = :user_id
");
$teacherQuery->bindParam(":user_id", $user_id, PDO::PARAM_INT);
$teacherQuery->execute();
$teacher = $teacherQuery->fetch(PDO::FETCH_ASSOC);

if ($teacher) {
    echo json_encode(["error"=> "Teacher not found"]);
    exit;
}

$teacher_id = $teacher["teacher_id"];

$courseQuery = $conn->prepare("
    SELECT C.course_id
    FROM Course_Sessions CS
    JOIN Courses C ON C.course_id = CS.course_id
    WHERE CS.session_id = :sid AND C.teacher_id = :tid
");
$courseQuery->bindParam(":sid", $session_id);
$courseQuery->bindParam(":tid", $teacher_id);
$courseQuery->execute();
$course = $courseQuery->fetch(PDO::FETCH_ASSOC);


if (!$course) {
    echo json_encode(["error" => "You are not authorized to record this attendance"]);
    exit;
}

$course_id = $course["course_id"];

$insertAttendanceQuery = $conn->prepare("
INSERT INTO Attendance (session_id, student_id, attendance_status)
VALUES (:session_id, :student_id, :status)
ON DUPLICATE KEY UPDATE attendance_status = :status
");

foreach ($attendance as $record) {

    $student_id = $record["student_id"];
    $status = $record["status"];

    $insertQuery->bindParam(":student_id", $student_id);
    $insertQuery->bindParam(":session_id", $session_id);
    $insertQuery->bindParam(":status", $status);

    $insertQuery->execute();
}

echo json_encode(["success" => true, "message" => "Attendance successfully saved"]);

?>