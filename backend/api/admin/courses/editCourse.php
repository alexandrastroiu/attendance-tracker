<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

// Error handling
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

    $data = json_decode(file_get_contents("php://input"), true);

    $course_id = isset($data["course_id"]) ? intval($data["course_id"]) : null;
    $course_name = trim($data["course_name"] ?? "");
    $course_type = $data["course_type"] ?? "";
    $teacher_id = isset($data["teacher_id"]) ? intval($data["teacher_id"]) : null;

    // Validate input (required fields)
    if (!$course_id) {
        echo json_encode(["success" => false, "error" => "Course ID required"]);
        exit;
    }

    if (!$course_name) {
        echo json_encode(["success" => false, "error" => "Course name required"]);
        exit;
    }

    if (!$course_type) {
        echo json_encode(["success" => false, "error" => "Course type required"]);
        exit;
    }

    if (!$teacher_id) {
        echo json_encode(["success" => false, "error" => "Teacher required"]);
        exit;
    }

    // Check course exists
    $checkCourse = $conn->prepare("SELECT course_id FROM Courses WHERE course_id = :course_id");
    $checkCourse->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $checkCourse->execute();

    if ($checkCourse->rowCount() == 0) {
        echo json_encode(["success" => false, "error" => "Course not found"]);
        exit;
    }

    // Prevent duplicate courses (combination of name & type must be different than existing courses)
    $checkDuplicate = $conn->prepare("
    SELECT course_id
    FROM Courses
    WHERE course_name = :course_name AND course_type = :course_type AND course_id != :course_id
    ");
    $checkDuplicate->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $checkDuplicate->bindParam(":course_name", $course_name);
    $checkDuplicate->bindParam(":course_type", $course_typee);
    $checkDuplicate->execute();

    if ($checkDuplicate->rowCount() > 0) {
        echo json_encode(["success" => false, "error" => "Another course with same name & type already exists"]);
        exit;
    }

    // Update course
    $updatecourse = $conn->prepare("
    UPDATE Courses
    SET course_name = :course_name,
    course_type = :course_type,
    teacher_id = :teacher_id
    WHERE course_id = :course_id
    ");
    $updatecourse->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $updatecourse->bindParam(":course_name", $course_name);
    $updatecourse->bindParam(":course_type", $course_type);
    $updatecourse->bindParam(":teacher_id", $teacher_id, PDO::PARAM_INT);
    $result = $updatecourse->execute();

    if ($result) {
        echo json_encode(["success" => true, "message" => "Course updated successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => "Failed to update course"]);
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

?>