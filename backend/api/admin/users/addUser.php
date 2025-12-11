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

    // Get the data from frontend
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data["username"], $data["password"], $data["user_role"], $data["user_email"])) {
        echo json_encode(["error" => "Missing required fields"]);
        exit;
    }

    $username = $data["username"];
    $user_email = $data["user_email"];
    $user_role = $data["user_role"];

    // Check if for duplicate username or email

    $validateUsername = $conn->prepare("
    SELECT user_id 
    FROM Users
    WHERE username = :username
    ");
    $validateUsername->bindParam(":username", $username);
    $validateUsername->execute();

    // Username is duplicate
    if ($validateUsername->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode(["error" => "Username already exists"]);
        exit;
    }

    $validateEmail = $conn->prepare("
    SELECT user_id
    FROM Users
    WHERE user_email = :user_email LIMIT 1
    ");
    $validateEmail->bindParam(":user_email", $user_email);
    $validateEmail->execute();

    // Email is duplicate
    if ($validateEmail->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode(["error" => "Email already exists"]);
        exit;
    }

    // Hash password
    $password = password_hash($data["password"], PASSWORD_BCRYPT);

    $conn->beginTransaction();

    // Insert the new user in the database
    $insertUser = $conn->prepare("
    INSERT INTO Users (username, user_password, user_role, user_email)
    VALUES (:username, :password, :user_role, :user_email)
    ");
    $insertUser->bindParam(":username", $username);
    $insertUser->bindParam(":password", $password);
    $insertUser->bindParam(":user_email", $user_email);
    $insertUser->bindParam(":user_role", $user_role);
    $insertUser->execute();

    $new_id = $conn->lastInsertId();

    // Insert into Students or Teachers table based on user role
    if ($user_role === 'student') {

        if (!isset($data['last_name'], $data['first_name'], $data['group_id'])) {
            echo json_encode(["error" => "Missing student required fields"]);
            exit;
        }

        $insertStudent = $conn->prepare("
      INSERT INTO Students (user_id, first_name, last_name, group_id)
      VALUES (:user_id, :first_name, :last_name, :group_id)
      ");

        $insertStudent->bindParam(":user_id", $new_id);
        $insertStudent->bindParam(":first_name", $data["first_name"]);
        $insertStudent->bindParam(":last_name", $data["last_name"]);
        $insertStudent->bindParam(":group_id", $data["group_id"]);
        $insertStudent->execute();
    } else if ($user_role === 'teacher') {

        if (!isset($data['last_name'], $data['first_name'], $data['department_id'])) {
            echo json_encode(["error" => "Missing teacher required fields"]);
            exit;
        }

        $insertTeacher = $conn->prepare("
      INSERT INTO Teachers (user_id, first_name, last_name, department_id)
      VALUES (:user_id, :first_name, :last_name, :department_id)
      ");
        $insertTeacher->bindParam(":user_id", $new_id);
        $insertTeacher->bindParam(":first_name", $data["first_name"]);
        $insertTeacher->bindParam(":last_name", $data["last_name"]);
        $insertTeacher->bindParam(":department_id", $data["department_id"]);
        $insertTeacher->execute();
    }

    $conn->commit();

    // Send data in JSON format
    echo json_encode([
        "success" => "User added successfully",
        "user" => [
            "user_id" => intval($new_id),
            "username" => $username,
            "user_role" => $user_role,
            "user_email" => $user_email
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>