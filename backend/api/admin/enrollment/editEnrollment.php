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

    // Get input data from frontend
    $data = json_decode(file_get_contents("php://input"), true);

    $student_id = isset($data['student_id']) ? intval($data['student_id']) : null;
    $course_id = isset($data['course_id']) ? intval($data['course_id']) : null;
    $enrollment_type = trim($data['enrollment_type'] ?? '');

    // Validate inputs (required fields)
    if (!$student_id) {
        echo json_encode(["success" => false, "error" => "Student required"]);
        exit;
    }

    if (!$course_id) {
        echo json_encode(["success" => false, "error" => "Course required"]);
        exit;
    }

    if (!$enrollment_type) {
        echo json_encode(["success" => false, "error" => "Enrollment type required"]);
        exit;
    }

    // Check if enrollment exists
    $checkEnrollment = $conn->prepare("
        SELECT * FROM Course_Enrollment
        WHERE student_id = :student_id AND course_id = :course_id
    ");
    $checkEnrollment->bindParam(":student_id", $student_id, PDO::PARAM_INT);
    $checkEnrollment->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $checkEnrollment->execute();

    if ($checkEnrollment->rowCount() === 0) {
        echo json_encode(["success" => false, "error" => "Enrollment not found"]);
        exit;
    }

    // Update enrollment type in the database
    $update = $conn->prepare("
        UPDATE Course_Enrollment
        SET enrollment_type = :enrollment_type
        WHERE student_id = :student_id AND course_id = :course_id
    ");
    $update->bindParam(":enrollment_type", $enrollment_type);
    $update->bindParam(":student_id", $student_id, PDO::PARAM_INT);
    $update->bindParam(":course_id", $course_id, PDO::PARAM_INT);

    if ($update->execute()) {
        echo json_encode(["success" => true, "message" => "Enrollment updated successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => "Failed to update enrollment"]);
    }

}
catch (Exception $e) {
    echo json_encode(["success"=> false, "error" => $e->getMessage()]);
}

?>