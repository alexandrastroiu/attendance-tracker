<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

// Error handling
try {

    // Fetch all students information
    $usersQuery = $conn->prepare("
    SELECT U.user_id, U.username,
    CONCAT(S.first_name, ' ' , S.last_name) AS student_name
    FROM Users U
    JOIN Students S ON S.user_id = U.user_id
    WHERE user_role = 'student'
    ");
    $usersQuery->execute();
    $users = $usersQuery->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($users);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

?>