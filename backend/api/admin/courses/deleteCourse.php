<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start(); //Resume or start session

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

    $course_id = isset($data["course_id"]) ? intval($data["course_id"])  : null;

    if (!$course_id) {
        echo json_encode(["success" => false, 'error' => 'Course required']);
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

    $conn->beginTransaction();

    // Delete related attendance data
    $deleteAttendance = $conn->prepare("
    DELETE A
    FROM Attendance A
    INNER JOIN Course_Sessions CS ON CS.session_id = A.session_id
    WHERE CS.course_id = :course_id
    ");
    $deleteAttendance->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $deleteAttendance->execute();

    // Delete related course sessions data
    $deleteSessions = $conn->prepare("
    DELETE FROM Course_Sessions
    WHERE course_id = :course_id
    ");
    $deleteSessions->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $deleteSessions->execute();

    // Delete enrollments related to the course
    $deleteEnrollments = $conn->prepare("
    DELETE FROM Course_Enrollment
    WHERE course_id = :course_id
    ");
    $deleteEnrollments->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $deleteEnrollments->execute();

    // Delete the course from the database
    $deleteCourse = $conn->prepare("
    DELETE FROM Courses
    WHERE course_id = :course_id
    ");
    $deleteCourse->bindParam(":course_id", $course_id, PDO::PARAM_INT);
    $deleteCourse->execute();

    $conn->commit();

    echo json_encode(["success"=> true,"message"=> "Course deleted successfully from database"]);

}
catch (Exception $e) {
    
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }

    echo json_encode([    "success"=> false,"error"=> $e->getMessage()]);
}

?>