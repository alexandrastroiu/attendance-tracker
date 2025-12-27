<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

// Error handling
try {
    // Fetch data abiut teachers
    $teachers = $conn->prepare("
        SELECT U.user_id, U.username, T.first_name, T.last_name,T.teacher_id,
        CONCAT(T.first_name, ' ', T.last_name) AS teacher_name
        FROM Users U
        JOIN Teachers T ON U.user_id = T.user_id
        WHERE U.user_role = 'teacher'
    ");

    $teachers->execute();

    // Return data in JSON format
    echo json_encode($teachers->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
