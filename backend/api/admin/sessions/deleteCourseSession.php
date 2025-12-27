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
        echo json_encode(['error' => 'Not logged in']);
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
        echo json_encode(['error' => 'Access denied. You are not an administrator']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $session_id = isset($data["session_id"]) ? intval($data["session_id"]) : null;

    if ($session_id === null || $session_id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid session ID']);
        exit;
    }

    $conn->beginTransaction();

    // Delete attendance tied to the course session
    $deleteAttendance = $conn->prepare("
    DELETE FROM Attendance
    WHERE session_id = :session_id
    ");
    $deleteAttendance->bindParam(":session_id", $session_id, PDO::PARAM_INT);
    $deleteAttendance->execute();
    // Delete session from database
    $deleteSession = $conn->prepare("
    DELETE FROM Course_Sessions
    WHERE session_id = :session_id
    ");
    $deleteSession->bindParam(":session_id", $session_id, PDO::PARAM_INT);
    $deleteSession->execute();

    $conn->commit();

    // Return message in JSON format
    echo json_encode(["success" => true, "message" => "Course session deleted"]);
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
