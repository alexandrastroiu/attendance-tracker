<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

try {
    $departments = $conn->prepare("
    SELECT department_id, department_name
    FROM Departments
    ORDER By department_name ASC
    ");
    $departments->execute();
    $dep = $departments->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($dep);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>