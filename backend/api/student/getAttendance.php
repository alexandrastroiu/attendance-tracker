<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start(); // Resume the session or start a new session

try {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }

    if (!isset($_SESSION['student_id'])) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    $student_id = intval($_SESSION['student_id']);

    // Get input from frontend
    $course_id = isset($_GET['course_id']) ? intval($_GET['course_id']) : null;
    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'recent';

    if (!$course_id) {
        echo json_encode(["error" => "Course ID required"]);
        exit;
    }

    // Base SQL Query
    //TODO: filtering attendance up to the current date on the backend
    $query = "
    SELECT
    S.session_id,
    S.session_date,
    A.attendance_status
    FROM Course_Sessions S
    LEFT JOIN Attendance A
    ON A.session_id = S.session_id AND A.student_id = :student_id
    WHERE S.course_id = :course_id
    AND S.session_date <= CURDATE()
    ";

    switch ($sort) {
        case 'oldest': // attendance sorted by oldest date
            $query .= " ORDER BY S.session_date ASC";
            break;
        case 'absences': // absences only
            $query .= " AND A.attendance_status != 'Present' ORDER BY S.session_date DESC";
            break;
        default: // most recent
            $query .= " ORDER BY S.session_date DESC";

    }

    $attendanceQuery = $conn->prepare($query);
    $attendanceQuery->bindParam(':student_id', $student_id, PDO::PARAM_INT);
    $attendanceQuery->bindParam(':course_id', $course_id, PDO::PARAM_INT);
    $attendanceQuery->execute();

    // Fetch data
    $studentAttendance = $attendanceQuery->fetchAll(PDO::FETCH_ASSOC);

    // Encode data in JSON format
    echo json_encode($studentAttendance);

} catch (Exception $e) {
    // Error handling
    echo json_encode(["error" => $e->getMessage()]);
}

?>