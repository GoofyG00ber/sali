<?php
require_once 'config.php';

// This endpoint tests the database connection and lists all tables

try {
    $db = getDB();
    
    $stmt = $db->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $result = [
        'status' => 'success',
        'message' => 'Database connection successful',
        'database' => DB_NAME,
        'tables' => $tables,
        'php_version' => phpversion(),
        'pdo_available' => extension_loaded('pdo'),
        'pdo_mysql_available' => extension_loaded('pdo_mysql')
    ];
    
    sendJSON($result);
} catch (Exception $e) {
    sendJSON([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ], 500);
}
?>
