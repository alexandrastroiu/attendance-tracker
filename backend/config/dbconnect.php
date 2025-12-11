<?php

// Database credentials
$host = "localhost";
$port = 8889;  // port is 8889 for MAMP, 3306 for XAMPP
$db_name = "attendance_management";
$username = "root";  // default
$password = "root"; // default

try {
    // Create a new PDO instance
    $conn = new PDO("mysql:host=$host;port=$port;dbname=$db_name;charset=utf8", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Message for successful connection
    // echo "Connected to $db_name successfully.";
} catch (PDOException $e) {
    die("Could not connect to the database $db_name :" . $e->getMessage());
}

?>