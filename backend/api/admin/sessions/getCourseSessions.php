<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

try {
    // Validate if user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false,'error'=> 'Not logged in']);
        exit;
    }

    $user_id = intval($_SESSION['user_id']);
 
    $validateAdmin = $conn->prepare("
    SELECT user_role
    FROM Users
    WHERE user_id = :user_id
    ");

    $validateAdmin->bindParam(":user_id", $user_id, PDO::PARAM_INT);
    $validateAdmin->execute();
    $admin = $validateAdmin->fetch(PDO::FETCH_ASSOC);

    // Validate logged in user is an admin
    if (!$admin || $admin["user_role"] !== 'admin') {
        echo json_encode(['error'=> 'Access denied. You are not an administrator']);
        exit;
    }

    // Fetch all course sessions
    $getSessions = $conn->prepare("
    SELECT
    CS.session_id, CS.course_id, CS.session_date, CS.session_time, CS.duration,
    C.course_name
    FROM Course_Sessions CS
    JOIN Courses C ON C.course_id = CS.course_id
    ORDER BY CS.session_date, CS.session_time
    ");

    $getSessions->execute();
    $sessions = $getSessions->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "sessions" => $sessions]);
}
catch (Exception $e) {
  echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

?>