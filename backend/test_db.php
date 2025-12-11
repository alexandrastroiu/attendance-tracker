<?php
require_once 'config/dbconnect.php';

// Test query
try {
    // Check the connection to the database
    $stmt = $conn->query("SELECT DATABASE()");
    $db = $stmt->fetchColumn();
    echo "<br>Connection test was successful. Current DB: $db";
} catch (PDOException $e) {
    echo "Connection test failed: " . $e->getMessage();
}
?>