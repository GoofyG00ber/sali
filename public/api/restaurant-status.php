<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];

// GET /api/restaurant-status - Get restaurant status
if ($method === 'GET') {
    // Get manual override status
    $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    $stmt->execute(['manual_open']);
    $setting = $stmt->fetch();
    $manualOpen = $setting ? ($setting['setting_value'] === 'true') : true;
    
    // Get current time in Hungary timezone
    date_default_timezone_set('Europe/Budapest');
    $now = new DateTime();
    $currentDay = (int)$now->format('w'); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    $currentTimeValue = (int)$now->format('H') * 60 + (int)$now->format('i');
    
    $dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    $todayName = $dayNames[$currentDay];
    
    // Get opening hours for today
    $hoursStmt = $db->prepare("SELECT * FROM open_hours WHERE name_of_day = ?");
    $hoursStmt->execute([$todayName]);
    $todayHours = $hoursStmt->fetch();
    
    $isOpenBySchedule = false;
    $schedule = null;
    
    if ($todayHours) {
        $fromDate = new DateTime($todayHours['from_time']);
        $tilDate = new DateTime($todayHours['til_time']);
        
        $fromValue = (int)$fromDate->format('H') * 60 + (int)$fromDate->format('i');
        $tilValue = (int)$tilDate->format('H') * 60 + (int)$tilDate->format('i');
        
        if ($fromValue !== $tilValue) {
            $isOpenBySchedule = $currentTimeValue >= $fromValue && $currentTimeValue < $tilValue;
        }
        
        $schedule = [
            'day' => $todayName,
            'from' => $fromDate->format('H:i'),
            'to' => $tilDate->format('H:i'),
            'isOpen' => $fromValue !== $tilValue
        ];
    }
    
    $isOpen = $manualOpen && $isOpenBySchedule;
    
    sendJSON([
        'isOpen' => $isOpen,
        'manualOpen' => $manualOpen,
        'isOpenBySchedule' => $isOpenBySchedule,
        'schedule' => $schedule,
        'message' => $isOpen 
            ? 'Nyitva vagyunk' 
            : ($manualOpen ? 'Jelenleg zárva vagyunk (nyitvatartási időn kívül)' : 'Jelenleg zárva vagyunk (technikai okok miatt)')
    ]);
}

// POST /api/restaurant-status - Update manual status
if ($method === 'POST') {
    $data = getJSONInput();
    $manualOpen = $data['manualOpen'] ? 'true' : 'false';
    
    $stmt = $db->prepare("
        INSERT INTO settings (setting_key, setting_value) 
        VALUES ('manual_open', ?)
        ON DUPLICATE KEY UPDATE setting_value = ?
    ");
    $stmt->execute([$manualOpen, $manualOpen]);
    
    sendJSON([
        'success' => true,
        'manualOpen' => $data['manualOpen']
    ]);
}

sendJSON(['error' => 'Method not allowed'], 405);
?>
