<?php
// Database configuration
define('DB_HOST', 'mysql.rackhost.hu');
define('DB_PORT', '3306');
define('DB_USER', 'c64634sali');
define('DB_PASS', 'asdfasmc123');
define('DB_NAME', 'c64634db');

// Admin password (loaded from environment or config)
define('ADMIN_PASSWORD', 'NagyonPizza123');

// SMTP Configuration (for email sending)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'czanik.csanad@gmail.com');
define('SMTP_PASS', 'rvfibttfjqqnxdfa');
define('MAIL_FROM', 'czanik.csanad@gmail.com');

// Barion configuration
define('BARION_POS_KEY', '4926b2ca-633f-420a-b1dc-c2d03e669fdf');
define('BARION_PIXEL_KEY', 'BPT-hYHMuJnLux-BC');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Create database connection
function getDB() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
        exit();
    }
}

// Helper function to send JSON response
function sendJSON($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
}

// Helper function to get JSON input
function getJSONInput() {
    $input = file_get_contents('php://input');
    return json_decode($input, true);
}
?>
