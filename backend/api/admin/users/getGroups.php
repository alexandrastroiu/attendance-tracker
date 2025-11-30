<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();

try {
    $studentGroups = $conn->prepare("
    SELECT group_id, group_name
    FROM Student_Groups
    ORDER By group_name ASC
    ");
    $studentGroups->execute();
    $groups = $studentGroups->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($groups);
}
catch (Exception $e) {
    echo json_encode(["error"=> $e->getMessage()]);
}
?>