<?php
/**
 * Router for PHP built-in server
 * This handles URL rewriting since .htaccess doesn't work with php -S
 * 
 * Usage: php -S localhost:8080 router.php
 */

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Remove query string for routing
$routePath = strtok($path, '?');

// Serve static files directly
if (preg_match('/\.(?:png|jpg|jpeg|gif|svg|css|js|ico|woff|woff2|ttf|eot|json)$/', $routePath)) {
    return false; // Serve the file as-is
}

// API routing
if (strpos($routePath, '/api/') === 0) {
    // CORS headers
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    // Handle preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
    // Route to appropriate PHP file
    if (preg_match('#^/api/admin/(verify|password)#', $routePath)) {
        require __DIR__ . '/api/admin.php';
        exit();
    }
    
    if ($routePath === '/api/restaurant-status') {
        require __DIR__ . '/api/restaurant-status.php';
        exit();
    }
    
    if ($routePath === '/api/opening-hours') {
        require __DIR__ . '/api/opening-hours.php';
        exit();
    }
    
    if (preg_match('#^/api/categories#', $routePath)) {
        require __DIR__ . '/api/categories.php';
        exit();
    }
    
    if (preg_match('#^/api/foods#', $routePath)) {
        require __DIR__ . '/api/foods.php';
        exit();
    }
    
    if (preg_match('#^/api/top-pizzas#', $routePath)) {
        require __DIR__ . '/api/top-pizzas.php';
        exit();
    }
    
    if (preg_match('#^/api/orders#', $routePath)) {
        require __DIR__ . '/api/orders.php';
        exit();
    }
    
    if (preg_match('#^/api/policies#', $routePath)) {
        require __DIR__ . '/api/policies.php';
        exit();
    }
    
    if (preg_match('#^/api/barion/#', $routePath)) {
        require __DIR__ . '/api/barion.php';
        exit();
    }
    
    if ($routePath === '/api/test') {
        require __DIR__ . '/api/test.php';
        exit();
    }
    
    // API endpoint not found
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'API endpoint not found: ' . $routePath]);
    exit();
}

// Handle send-email
if ($routePath === '/send-email') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
    require __DIR__ . '/send-email.php';
    exit();
}

// Serve index.html for all other routes (SPA routing)
if (file_exists(__DIR__ . $routePath) && is_file(__DIR__ . $routePath)) {
    return false; // Serve the file
}

// Default to index.html for SPA routes
require __DIR__ . '/index.html';
?>
