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
        echo json_encode(['error'=> 'Not logged in']);
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

    $data = json_decode(file_get_contents("php://input"), true);

    $course_id = isset($data["course_id"]) ? intval($data["course_id"]) : null;
    $session_date = $data["session_date"] ?? null;
    $session_time = $data["session_time"] ?? null;
    $duration = $data["duration"] ?? null;

    // Check if there is already a course session with the same date and time in the database
    $sessionCheck = $conn->prepare("
    SELECT session_id
    FROM Course_Sessions
    WHERE session_date = :session_date
    AND session_time = :session_time
    ");
    $sessionCheck->bindParam(":session_date", $session_date);
    $sessionCheck->bindParam(":session_time", $session_time);
    $sessionCheck->execute();

    if ($sessionCheck->rowCount() > 0) {
        echo json_encode([
            "success" => false,
            "error" => "A session already exists at this time. Timetable conflict."
        ]);
        exit;
    }

    // Insert new session into the database
    $insertSession = $conn->prepare("
    INSERT INTO Course_Sessions (course_id, session_date, session_time, duration)
    VALUES (:course_id, :session_date, :session_time, :duration)
    ");
    $insertSession->bindParam(":course_id", $course_id);
    $insertSession->bindParam(":session_date", $session_date);
    $insertSession->bindParam(":start_time", $start_time);
    $insertSession->bindParam(":end_time", $end_time);
    $insertSession->execute();

        echo json_encode(["success"=>true,"message"=>"Session added"]);
}
catch (Exception $e) {
    echo json_encode(["success"=>false,"error"=>$e->getMessage()]);
}

?>