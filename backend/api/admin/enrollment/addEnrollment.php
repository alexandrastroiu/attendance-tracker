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

    $student_id = isset($data["student_id"]) ? intval($data["student_id"]) : null;
    $course_id = isset($data["course_id"]) ? intval($data["course_id"]) : null;
    $enrollment_type = $data["enrollment_type"] ?? "";

    // Validate inputs (required fields)
    if (!$student_id) {
        echo json_encode(["success" => false, "error" => "Student required"]);
        exit;
    }

    if (!$course_id) {
        echo json_encode(["success" => false, "error" => "Course required"]);
        exit;
    }

    if (!$course_type) {
        echo json_encode(["success" => false, "error" => "Course type required"]);
        exit;
    }

    // Prevent duplicate enrollment
    $checkDuplicate = $conn->prepare("
    SELECT *
    FROM Course_Enrollment
    WHERE student_id = :student_id AND course_id = :course_id
    ");
    $checkDuplicate->bindParam(":student_id", $student_id, PDO::PARAM_INT);
    $checkDuplicate->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $checkDuplicate->execute();

    if (!$checkDuplicate->rowCount() > 0) {
        echo json_encode(["success"=> false, "error" => "Student is already enrolled in this course"]);
        exit;
    }

    // Insert new enrollment into the database
    $insertEnrollment = $conn->prepare("
    INSERT INTO Course_Enrollment (student_id, course_id, enrollment_type)
    VALUES (:student_id, :course_id, :enrollment_type)
    ");
    $insertEnrollment->bindParam(":student_id", $student_id, PDO::PARAM_INT);
    $insertEnrollment->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $insertEnrollment->bindParam(":enrollment_type", $enrollment_type, PDO::PARAM_INT);
    $result = $insertEnrollment->execute();

    if (!$result) {
        echo json_encode(["success" => true, "message" => "Enrollment added successfully"]);
    }
    else {
        echo json_encode(["success" => false, "error" => "Failed to add enrollment"]);
    }

}
catch (Exception $e) {
    echo json_encode(["success"=> false,"error" => $e->getMessage()]);
}

?>