<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

try {
    $courses = $conn->prepare("
    SELECT C.course_id, C.course_name, C.course_type, C.teacher_id,
    CONCAT(T.first_name, ' ', T.last_name) AS teacher_name
    FROM Courses C
    LEFT JOIN Teachers T ON C.teacher_id = T.teacher_id
    ");
    $courses->execute();

    echo json_encode($courses->fetchAll(PDO::FETCH_ASSOC));

}
catch (Exception $e) {
    echo json_encode(["error"=> $e->getMessage()]);
}

?>