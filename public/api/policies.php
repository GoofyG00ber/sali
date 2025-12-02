<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// GET /api/policies/:id - Get policy by ID
if ($method === 'GET' && preg_match('/\/(aszf|privacy)$/', $path, $matches)) {
    $id = $matches[1];
    
    $stmt = $db->prepare("SELECT * FROM policies WHERE id = ?");
    $stmt->execute([$id]);
    $policy = $stmt->fetch();
    
    if (!$policy) {
        sendJSON(['error' => 'Policy not found'], 404);
    }
    
    sendJSON([
        'id' => $policy['id'],
        'title' => $policy['title'],
        'content' => $policy['content'],
        'lastUpdated' => $policy['last_updated']
    ]);
}

// GET /api/policies - Get all policies
if ($method === 'GET' && !preg_match('/\/[^\/]+/', $path)) {
    $stmt = $db->query("SELECT * FROM policies");
    $policies = $stmt->fetchAll();
    
    $result = [];
    foreach ($policies as $policy) {
        $result[] = [
            'id' => $policy['id'],
            'title' => $policy['title'],
            'content' => $policy['content'],
            'lastUpdated' => $policy['last_updated']
        ];
    }
    
    sendJSON($result);
}

// PUT /api/policies/:id - Update policy
if ($method === 'PUT' && preg_match('/\/([^\/]+)$/', $path, $matches)) {
    $id = $matches[1];
    $data = getJSONInput();
    
    $stmt = $db->prepare("UPDATE policies SET content = ?, last_updated = NOW() WHERE id = ?");
    $stmt->execute([$data['content'], $id]);
    
    // Fetch updated policy
    $stmt = $db->prepare("SELECT * FROM policies WHERE id = ?");
    $stmt->execute([$id]);
    $policy = $stmt->fetch();
    
    sendJSON([
        'id' => $policy['id'],
        'title' => $policy['title'],
        'content' => $policy['content'],
        'lastUpdated' => $policy['last_updated']
    ]);
}

sendJSON(['error' => 'Not found'], 404);
?>
