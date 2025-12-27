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
        echo json_encode(["success" => false, 'error' => 'Not logged in']);
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
        echo json_encode(["success" => false, 'error' => 'Access denied. You are not an administrator']);
        exit;
    }

    // Get input from frontend
    $data = json_decode(file_get_contents("php://input"), true);
    $student_id = isset($data['student_id']) ? intval($data['student_id']) : null;
    $course_id = isset($data['course_id']) ? intval($data['course_id']) : null;

    // Validate input
    if (!$student_id || !$course_id) {
        echo json_encode(["success" => false, "error" => "Student ID and Course ID are required"]);
        exit;
    }

    $conn->beginTransaction();

    // Delete attendance linked to course
    $deleteAttendance = $conn->prepare("
    DELETE A
    FROM Attendance A
    INNER JOIN Course_Sessions CS ON CS.session_id = A.session_id
    WHERE A.student_id = :student_id
    AND CS.course_id = :course_id
    ");
    $deleteAttendance->bindParam(":student_id", $student_id, PDO::PARAM_INT);
    $deleteAttendance->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $deleteAttendance->execute();

    // Delete enrollment from database
    $deleteEnrollment = $conn->prepare("
        DELETE FROM Course_Enrollment
        WHERE student_id = :student_id AND course_id = :course_id
    ");
    $deleteEnrollment->bindParam(":student_id", $student_id, PDO::PARAM_INT);
    $deleteEnrollment->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $deleteEnrollment->execute();

    $conn->commit();

    // Return message in JSON format
    echo json_encode(["success" => true, "message" => "Enrollment and related attendance deleted successfully"]);
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
