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

    // Get input data from frontend
    $data = json_decode(file_get_contents("php://input"), true);

    $course_name = trim($data["course_name"] ?? "");
    $course_type = $data["course_type"] ?? "";
    $teacher_id = isset($data["teacher_id"]) ? intval($data["teacher_id"]) : null;

    // Validate input (required fields)
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

    // Prevent inserting duplicate courses
    $validateCourse = $conn->prepare("
    SELECT course_id
    FROM Courses
    WHERE course_name = :course_name AND course_type = :course_type
    ");
    $validateCourse->bindParam(":course_name", $course_name);
    $validateCourse->bindParam(":course_type", $course_type);
    $validateCourse->execute();

    if ($validateCourse->rowCount() > 0) {
        echo json_encode(["success" => false, "error" => "This course already exists"]);
        exit;
    }

    // Insert the new course into the database
    $insertCourse = $conn->prepare("
    INSERT INTO Courses (course_name, course_type, teacher_id)
    VALUES (:course_name, :course_type, :teacher_id)
    ");
    $insertCourse->bindParam(":course_name", $course_name);
    $insertCourse->bindParam(":course_type", $course_type);
    $insertCourse->bindParam(":teacher_id", $teacher_id, PDO::PARAM_INT);
    $result = $insertCourse->execute();

    // Send data in JSON format
    if ($result) {
        echo json_encode(["success" => true, "message" => "Course added successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => "Database insert failed"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}

?>