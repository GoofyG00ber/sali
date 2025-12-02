<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST /api/admin/verify - Verify admin password
if ($method === 'POST' && strpos($_SERVER['REQUEST_URI'], '/verify') !== false) {
    $data = getJSONInput();
    $password = $data['password'] ?? '';
    
    $valid = ($password === ADMIN_PASSWORD);
    
    sendJSON(['valid' => $valid]);
}

// PUT /api/admin/password - Update admin password
if ($method === 'PUT' && strpos($_SERVER['REQUEST_URI'], '/password') !== false) {
    $data = getJSONInput();
    $oldPassword = $data['oldPassword'] ?? '';
    $newPassword = $data['newPassword'] ?? '';
    
    if (empty($newPassword)) {
        sendJSON(['success' => false, 'error' => 'Invalid newPassword'], 400);
    }
    
    // Verify old password
    if ($oldPassword !== ADMIN_PASSWORD) {
        sendJSON(['success' => false, 'error' => 'Old password mismatch'], 403);
    }
    
    // Update .env file
    $envPath = __DIR__ . '/../../server/.env';
    $envContent = file_get_contents($envPath);
    $lines = explode("\n", $envContent);
    $found = false;
    $newLines = [];
    
    foreach ($lines as $line) {
        if (strpos($line, 'ADMIN_PASSWORD=') === 0) {
            $newLines[] = 'ADMIN_PASSWORD=' . $newPassword;
            $found = true;
        } else {
            $newLines[] = $line;
        }
    }
    
    if (!$found) {
        $newLines[] = 'ADMIN_PASSWORD=' . $newPassword;
    }
    
    file_put_contents($envPath, implode("\n", $newLines));
    
    sendJSON(['success' => true]);
}

sendJSON(['error' => 'Not found'], 404);
?>
