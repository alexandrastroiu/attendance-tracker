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

    // Get data from frontend
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["user_id"])) {
        echo json_encode(['error' => 'Missing user ID']);
        exit;
    }

    $user_id_delete = intval($data['user_id']);

    // Logged in admin cannot delete their own account
    if ($user_id_delete === $user_id) {
        echo json_encode(['error' => 'Cannot delete yourself']);
        exit;
    }

    $conn->beginTransaction();

    $userQuery = $conn->prepare('
    SELECT user_id, username, user_role
    FROM Users
    WHERE user_id = :id
    ');
    $userQuery->bindParam(':id', $user_id_delete, PDO::PARAM_INT);
    $userQuery->execute();
    $user = $userQuery->fetch(PDO::FETCH_ASSOC);

    // User is not found in the database
    if (!$user) {
        $conn->rollBack();
        echo json_encode(['error' => 'User not found']);
        exit;
    }

    $user_role = $user['user_role'];
    $summary = ['username' => $user['username'], 'role' => $user_role];
    $summary['enrollments_deleted'] = 0;
    $summary['attendance_deleted'] = 0;

    // Delete user from Users & all linked data from other tables
    if ($user_role === 'student') {

        $student = $conn->prepare("
        SELECT student_id from Students
        WHERE user_id = :id
        ");
        $student->execute([':id' => $user_id_delete]);
        $student_id = $student->fetchColumn();

        if ($student_id) {
            $enrollments = $conn->prepare('
        SELECT COUNT(*)
        FROM Course_Enrollment
        WHERE student_id = :id
        ');
            $enrollments->bindParam(':id', $student_id, PDO::PARAM_INT);
            $enrollments->execute();
            $summary['enrollments_deleted'] = $enrollments->fetchColumn();

            $attendance = $conn->prepare('
        SELECT COUNT(*)
        FROM Attendance
        WHERE student_id = :id
        ');
            $attendance->bindParam(':id', $student_id, PDO::PARAM_INT);
            $attendance->execute();
            $summary['attendance_deleted'] = $attendance->fetchColumn();

            // Delete data from Atendance tabel and Course_Enrollment if needed
            $conn->prepare('
        DELETE FROM Attendance
        WHERE student_id = :id')->execute([':id' => $student_id]);
            $conn->prepare('
        DELETE FROM Course_Enrollment
        WHERE student_id = :id
        ')->execute([':id' => $student_id]);
            $conn->prepare('DELETE FROM Students
        WHERE user_id = :id
        ')->execute([':id' => $user_id_delete]);
        }
    } else if ($user_role === 'teacher') {

        $teacher = $conn->prepare('
        SELECT teacher_id
        FROM Teachers
        WHERE user_id = :id
        ');
        $teacher->execute([':id' => $user_id_delete]);
        $teacher_id = $teacher->fetchColumn();

        if ($teacher_id) {

            // Get the courses taught by the teacher that will be deleted from the database
            $courses = $conn->prepare("SELECT course_id FROM Courses WHERE teacher_id = :id");
            $courses->execute([':id' => $teacher_id]);
            $course_ids = $courses->fetchAll(PDO::FETCH_COLUMN);

            $summary['courses_deleted'] = count($course_ids);

            foreach ($course_ids as $cid) {
                $enrollmentCount = $conn->prepare("SELECT COUNT(*) FROM Course_Enrollment WHERE course_id = :cid");
                $enrollmentCount->execute([':cid' => $cid]);
                $summary['enrollments_deleted'] += $enrollmentCount->fetchColumn();

                $attendanceCount = $conn->prepare("SELECT COUNT(*) FROM Attendance WHERE course_id = :cid");
                $attendanceCount->execute([':cid' => $cid]);
                $summary['attendance_deleted'] += $attendanceCount->fetchColumn();

                $conn->prepare("DELETE FROM Attendance WHERE course_id = :cid")->execute([':cid' => $cid]);
                $conn->prepare("DELETE FROM Course_Enrollment WHERE course_id = :cid")->execute([':cid' => $cid]);
            }

            // Delete records from database
            $conn->prepare("DELETE FROM Courses WHERE teacher_id = :id")->execute([':id' => $teacher_id]);
            $conn->prepare("DELETE FROM Teachers WHERE user_id = :id")->execute([':id' => $user_id_delete]);
        }
    }

    // Delete the user from the database
    $conn->prepare('
    DELETE FROM Users
    WHERE user_id = :id
    ')->execute([':id' => $user_id_delete]);

    $conn->commit();

    echo json_encode([
        "success" => "User and linked data deleted successfully from database",
        "summary" => $summary
    ]);
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo json_encode(['error' => $e->getMessage()]);
}
