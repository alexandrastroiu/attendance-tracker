<?php
session_start();  // Start the session
require_once __DIR__ . '/../config/dbconnect.php';// Allow requests from your React app
header("Access-Control-Allow-Origin: http://localhost:3000"); //allow connection with frontend (React runs on port 3000)
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    
    $password = $_POST['password'];


    $stmt = $conn->prepare("SELECT * FROM Users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['user_password'])) {
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];

        echo json_encode([
            'success' => true,
            'message' => 'Login successful'
        ]);
    }
    else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid username or password'
        ]);

    }
}
else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid request'
        ]);
}

?>