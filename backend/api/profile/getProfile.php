<?php
// Returns user profile information in JSON format.

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/dbconnect.php';
session_start(); // Resume the session or start a new session

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    $user_id = intval($_SESSION["user_id"]);

    // Get base information (user information)
    $userQuery = $conn->prepare("SELECT user_id, username, user_role, user_email
                                    FROM Users
                                    WHERE user_id = :user_id
");

    $userQuery->bindParam(":user_id", $user_id);
    $userQuery->execute();

    $user = $userQuery->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    // Get additional information based on role

    $role = $user["user_role"];

    if ($role === "student") {
        $studentProfileQuery = $conn->prepare("
SELECT S.student_id, S.last_name, S.first_name, S.group_id, SG.group_name,
CONCAT(S.first_name, ' ', S.last_name) AS student_name
FROM Students S
JOIN Student_Groups SG ON SG.group_id = S.group_id
WHERE S.user_id = :user_id
");
        $studentProfileQuery->bindParam(":user_id", $user_id);
        $studentProfileQuery->execute();
        $profile = $studentProfileQuery->fetch(PDO::FETCH_ASSOC);
    } else if ($role === "teacher") {
        $teacherProfileQuery = $conn->prepare("
    SELECT T.teacher_id, T.last_name, T.first_name, T.department_id, D.department_name,
    CONCAT(T.first_name, ' ', T.last_name) AS teacher_name
    FROM Teachers T
    JOIN Departments D ON D.department_id = T.department_id
    WHERE T.user_id = :user_id
    ");
        $teacherProfileQuery->bindParam(":user_id", $user_id);
        $teacherProfileQuery->execute();
        $profile = $teacherProfileQuery->fetch(PDO::FETCH_ASSOC);
    } else if ($role === "admin") {
        $profile = ["info" => "Admin account"];
    }

    echo json_encode(["user" => $user, "profile" => $profile]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
