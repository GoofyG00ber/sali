<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// GET /api/top-pizzas - Get top pizzas
if ($method === 'GET') {
    $stmt = $db->query("
        SELECT tp.id as top_id, mi.*
        FROM top_pizzas tp
        JOIN menu_items mi ON tp.item_id = mi.id
        WHERE mi.active = 1
    ");
    $rows = $stmt->fetchAll();
    
    if (empty($rows)) {
        sendJSON([]);
    }
    
    // Get item IDs
    $itemIds = array_column($rows, 'id');
    $placeholders = implode(',', array_fill(0, count($itemIds), '?'));
    
    $priceStmt = $db->prepare("SELECT * FROM item_prices WHERE item_id IN ($placeholders)");
    $priceStmt->execute($itemIds);
    $allPrices = $priceStmt->fetchAll();
    
    // Group prices by item_id
    $priceMap = [];
    foreach ($allPrices as $price) {
        $itemId = $price['item_id'];
        if (!isset($priceMap[$itemId])) {
            $priceMap[$itemId] = [];
        }
        $priceMap[$itemId][] = $price;
    }
    
    $result = [];
    foreach ($rows as $food) {
        $prices = [];
        $foodId = $food['id'];
        
        if (isset($priceMap[$foodId])) {
            foreach ($priceMap[$foodId] as $price) {
                $prices[] = [
                    'label' => $price['label'],
                    'price' => (float)$price['price']
                ];
            }
        }
        
        $result[] = [
            'id' => (int)$food['id'],
            'top_id' => (int)$food['top_id'],
            'title' => $food['title'],
            'description' => $food['description'],
            'image' => $food['image'],
            'category_id' => (int)$food['category_id'],
            'categoryId' => (int)$food['category_id'],
            'active' => (int)$food['active'],
            'prices' => $prices,
            'badges' => []
        ];
    }
    
    sendJSON($result);
}

// POST /api/top-pizzas - Add top pizza
if ($method === 'POST') {
    $data = getJSONInput();
    $itemId = $data['itemId'];
    
    // Check if already exists
    $stmt = $db->prepare("SELECT * FROM top_pizzas WHERE item_id = ?");
    $stmt->execute([$itemId]);
    if ($stmt->fetch()) {
        sendJSON(['error' => 'Item already in top pizzas'], 400);
    }
    
    // Check if item exists and is a pizza
    $stmt = $db->prepare("SELECT * FROM menu_items WHERE id = ? AND category_id = 1");
    $stmt->execute([$itemId]);
    if (!$stmt->fetch()) {
        sendJSON(['error' => 'Item not found or not a pizza'], 400);
    }
    
    $stmt = $db->prepare("INSERT INTO top_pizzas (item_id) VALUES (?)");
    $stmt->execute([$itemId]);
    $id = $db->lastInsertId();
    
    sendJSON(['id' => (int)$id, 'itemId' => (int)$itemId]);
}

// DELETE /api/top-pizzas/:id - Remove top pizza
if ($method === 'DELETE' && preg_match('/\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    
    $stmt = $db->prepare("DELETE FROM top_pizzas WHERE id = ?");
    $stmt->execute([$id]);
    
    sendJSON(['success' => true]);
}

sendJSON(['error' => 'Not found'], 404);
?>
