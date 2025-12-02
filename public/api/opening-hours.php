<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET /api/opening-hours - Get opening hours
if ($method === 'GET') {
    $stmt = $db->query("SELECT * FROM open_hours");
    $rows = $stmt->fetchAll();
    
    // Sort by day order
    $dayOrder = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat', 'Vasárnap'];
    usort($rows, function($a, $b) use ($dayOrder) {
        return array_search($a['name_of_day'], $dayOrder) - array_search($b['name_of_day'], $dayOrder);
    });
    
    sendJSON($rows);
}

// PUT /api/opening-hours - Update opening hours
if ($method === 'PUT') {
    $data = getJSONInput();
    $hours = $data['hours'] ?? [];
    
    if (!is_array($hours)) {
        sendJSON(['error' => 'Invalid data format'], 400);
    }
    
    $baseDate = '2000-01-01';
    
    foreach ($hours as $h) {
        $fromTime = $baseDate . ' ' . $h['open_time'] . ':00';
        $tilTime = $baseDate . ' ' . $h['close_time'] . ':00';
        
        $stmt = $db->prepare("
            UPDATE open_hours 
            SET from_time = ?, til_time = ? 
            WHERE name_of_day = ?
        ");
        $stmt->execute([$fromTime, $tilTime, $h['name_of_day']]);
    }
    
    sendJSON(['success' => true]);
}

sendJSON(['error' => 'Method not allowed'], 405);
?>
