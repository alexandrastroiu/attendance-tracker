<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

require_once __DIR__ . '/../../../config/dbconnect.php';
session_start();


try {
 $users = $conn->prepare('
 SELECT user_id, username, user_email, user_role
 FROM Users 
 ORDER BY username ASC
 ');
 $users->execute();
 $usr = $users->fetchAll(PDO::FETCH_ASSOC);

  
 echo json_encode($usr);
}
catch (Exception $e) {
    echo json_encode( ["error" => $e->getMessage()]);
}

?>