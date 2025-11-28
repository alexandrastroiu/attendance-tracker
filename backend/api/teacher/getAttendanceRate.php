<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start(); // Resume or start session

// Validate user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "Not logged in"]);
    exit;
}

$user_id = intval($_SESSION["user_id"]);


$teacherQuery = $conn->prepare("
SELECT teacher_id FROM Teachers WHERE user_id = :user_id LIMIT 1
");

$teacherQuery->bindParam(":user_id", $user_id);
$teacherQuery->execute();
$teacher = $teacherQuery->fetch(PDO::FETCH_ASSOC);

// Validate teacher
if (!$teacher) {
    echo json_encode(["error"=> "Teacher not found"]);
    exit;
}

$teacher_id = $teacher['teacher_id'];

// GET request
// get inputs from frontend
$course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : 0;
$group_id = isset($_GET['group_id']) ? intval($_GET['group_id']) : 0; 

// Validate course is selected from the dropdown in the frontend
if ($course_id === 0) {
    echo json_encode(['error'=> 'Course not selected']);
    exit;
}

$courseQuery = $conn->prepare("
    SELECT C.course_id
    FROM Courses C
    WHERE C.course_id = :course_id AND teacher_id = :teacher_id LIMIT 1
");

$courseQuery->bindParam(":teacher_id", $teacher_id, PDO::PARAM_INT);
$courseQuery->bindParam(":course_id", $course_id, PDO::PARAM_INT);
$courseQuery->execute();
$course = $courseQuery->fetch(PDO::FETCH_ASSOC);

// Validate that the logged in teacher teaches the selected course
if (!$course) {
    echo json_encode(["error" => "You are not authorized to record this attendance"]);
    exit;
}

// Fetch the total number of students enrolled in the selected course
$totalStudentsQuery = 
"SELECT COUNT(*) AS total_students
FROM Course_Enrollment CE
" . ($group_id > 0 ? "JOIN Students S ON CE.student_id = S.student_id WHERE CE.course_id = :course_id AND S.group_id = :group_id" : "WHERE CE.course_id = :course_id");

$totalStudents = $conn->prepare($totalStudentsQuery);
$totalStudents->bindParam(":course_id", $course_id, PDO::PARAM_INT);
if ($group_id > 0) {
$totalStudents->bindParam(":group_id", $group_id,PDO::PARAM_INT);
}
$totalStudents->execute();
$totalStudentsEnrolled = $totalStudents->fetch(PDO::FETCH_ASSOC)['total_students'];

// Fetch the total number of classes held until the current date for the selected course
$totalClassesQuery = "
SELECT COUNT(DISTINCT session_date) AS total_classes
FROM Course_Sessions
WHERE course_id = :course_id AND session_date <= CURDATE()
";
$totalClasses = $conn->prepare($totalClassesQuery);
$totalClasses->bindParam(":course_id", $course_id, PDO::PARAM_INT);
$totalClasses->execute();
$totalClassesHeld = $totalClasses->fetch(PDO::FETCH_ASSOC);

$totalClasses = $totalClassesHeld["total_classes"];

// Fetch the total attendances at course sessions until current date
$totalAttendancesQuery = "
SELECT COUNT(*) AS total_attendances
FROM Attendance A
JOIN Course_Sessions CS ON A.session_id = CS.session_id"
. ($group_id > 0 ? " JOIN Students S ON A.student_id = S.student_id" : "") . "
WHERE CS.course_id = :course_id
AND A.attendance_status = 'present'
AND CS.session_date <= CURDATE()"
. ($group_id > 0 ? " AND S.group_id = :group_id" : "");


$totalAttendances = $conn->prepare($totalAttendancesQuery);
$totalAttendances->bindParam(":course_id", $course_id,PDO::PARAM_INT);

if ($group_id > 0) {
$totalAttendances->bindParam(":group_id", $group_id,PDO::PARAM_INT);
}

$totalAttendances->execute();
$attendances = $totalAttendances->fetch(PDO::FETCH_ASSOC)["total_attendances"];


//Fetch the attendance rate for the selected course
$attendanceRateQuery = "
SELECT ROUND(
    :attendances / NULLIF(
        (
            SELECT COUNT(*) 
            FROM Course_Enrollment CE "
            . ($group_id > 0 ? "JOIN Students S ON S.student_id = CE.student_id " : "") .
        "WHERE CE.course_id = :course_id "
        . ($group_id > 0 ? "AND S.group_id = :group_id " : "") . "
        ) * :totalClasses
    , 0
    ) * 100, 2
) AS attendance_rate
";
$attendanceRate = $conn->prepare($attendanceRateQuery);
$attendanceRate->bindParam(":course_id", $course_id, PDO::PARAM_INT);
$attendanceRate->bindParam(":totalClasses", $totalClasses, PDO::PARAM_INT);
$attendanceRate->bindParam(":attendances", $attendances, PDO::PARAM_INT);

if ($group_id > 0) {
$attendanceRate->bindParam(":group_id", $group_id,PDO::PARAM_INT);
}

$attendanceRate->execute();
$attendance_rate = $attendanceRate->fetch(PDO::FETCH_ASSOC)["attendance_rate"];

// return data in JSON format
echo json_encode ([
"total_students" => $totalStudentsEnrolled,
"total_classes" => $totalClasses,
"total_attendaces" => $attendances,
"attendance_rate" => $attendance_rate
]);
?>