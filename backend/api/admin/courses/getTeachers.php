<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

try {
    $teachers = $conn->prepare("
        SELECT user_id, first_name, last_name
        FROM Users
        WHERE user_role = 'teacher'
    ");

    $teachers->execute();

    echo json_encode($teachers->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

?>