<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

// Error handling
try {

    // Fetch all enrollments 
    $enrollmentsQuery = $conn->prepare("
        SELECT CE.student_id, CE.course_id, CE.enrollment_type,
        CONCAT(S.first_name, ' ', S.last_name) AS student_name,
        C.course_name
        FROM Course_Enrollment CE
        JOIN Students S ON CE.student_id = S.student_id
        JOIN Courses C ON CE.course_id = C.course_id
    ");
    $enrollmentsQuery->execute();
    $enrollments = $enrollmentsQuery->fetchAll(PDO::FETCH_ASSOC);

    // Return data in JSON format
    echo json_encode($enrollments);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
