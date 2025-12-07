<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start();

define("MAX_ABSENCES", 5);

try{
// Validate user
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error'=> "Not logged in"]);
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
$max_absences = MAX_ABSENCES;

if (!$course_id) {
    echo json_encode(["error" => "Course ID is required"]);
    exit;
}

// Validate selected course
$courseChechQuery = $conn->prepare("
SELECT course_id, course_name
FROM Courses
WHERE course_id = :course_id AND teacher_id = :teacher_id
");

$courseChechQuery->bindParam(":course_id", $course_id);
$courseChechQuery->bindParam(":teacher_id", $teacher_id);
$courseChechQuery->execute();
$course = $courseChechQuery->fetch(PDO::FETCH_ASSOC);

if (!$course) {
    echo json_encode(["error"=> "You do not teach this course"]);
    exit;
}

// Fetch students enrolled in the selected course that have more absences than a specified threshold
// Uses subquery
$studentsQuery = $conn->prepare("
SELECT S.student_id, S.first_name, S.last_name, SG.group_name, 
COALESCE(absence_count.total_absences, 0) AS total_absences
FROM Students S
JOIN Course_Enrollment CE ON S.student_id = CE.student_id AND CE.course_id = :course_id
JOIN Student_Groups SG ON SG.group_id = S.group_id
LEFT JOIN (
SELECT A.student_id, COUNT(*) AS total_absences
FROM Attendance A
JOIN Course_Sessions CS ON CS.session_id = A.session_id
WHERE CS.course_id = :course_id
AND A.attendance_status = 'absent'
AND DATE(CS.session_date) <= CURDATE()
GROUP BY A.student_id
) AS absence_count ON S.student_id = absence_count.student_id
WHERE CE.course_id = :course_id
AND COALESCE(absence_count.total_absences, 0) >= :max_absences
ORDER BY  S.last_name, S.first_name
");

$studentsQuery->bindParam(":course_id", $course_id);
$studentsQuery->bindParam(":max_absences", $max_absences);
$studentsQuery->execute();
$students = $studentsQuery->fetchAll(PDO::FETCH_ASSOC);

if (!$students) {
    echo json_encode(["error"=> "No absent students found"]);
}

// Convert from PHP array to JSON format
echo json_encode($students);
}
catch (Exception $e) {
    echo json_encode(["error"=> $e->getMessage()]);
}

?>