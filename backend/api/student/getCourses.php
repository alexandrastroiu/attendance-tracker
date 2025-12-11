<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start(); // Resume the session or start a new session

try {

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }


    if (!isset($_SESSION['student_id'])) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    //Get student ID (contained in the current session)
    $student_id = intval($_SESSION['student_id']);

    // SQL query that selects data for all courses in which the student is enrolled
    $coursesQuery = $conn->prepare("
    SELECT 
    C.course_id, C.course_name, C.course_type, 
    CE.enrollment_type,
    CONCAT(T.first_name, ' ', T.last_name) AS teacher_name
    FROM Course_Enrollment CE
    JOIN Courses C ON CE.course_id = C.course_id
    JOIN Teachers T ON T.teacher_id = C.teacher_id
    WHERE CE.student_id = :student_id
    ");

    $coursesQuery->bindParam(':student_id', $student_id, PDO::PARAM_INT);

    $coursesQuery->execute();
    //Fetch data
    $studentCourses = $coursesQuery->fetchAll(PDO::FETCH_ASSOC);

    //Encode data in JSON format
    echo json_encode($studentCourses);

} catch (Exception $e) {
    // Error handling
    echo json_encode(["error" => $e->getMessage()]);
}

?>