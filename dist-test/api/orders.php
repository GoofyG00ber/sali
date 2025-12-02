<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Helper to build order response
function buildOrderResponse($order, $items) {
    $orderItems = [];
    foreach ($items as $item) {
        $extras = null;
        if (!empty($item['extras'])) {
            $extras = is_string($item['extras']) ? json_decode($item['extras'], true) : $item['extras'];
        }
        
        $orderItems[] = [
            'itemId' => (int)$item['item_id'],
            'foodTitle' => $item['item_title'] ?? 'Unknown Item',
            'priceLabel' => $item['price_label'] ?? '',
            'price' => (float)$item['price'],
            'quantity' => (int)$item['quantity'],
            'extras' => $extras
        ];
    }
    
    $paymentStatus = 'pending';
    if ($order['payment_method'] === 'barion') {
        if ($order['status'] === 'confirmed') {
            $paymentStatus = 'paid';
        } elseif ($order['status'] === 'cancelled') {
            $paymentStatus = 'failed';
        }
    }
    
    return [
        'id' => (string)$order['id'],
        'items' => $orderItems,
        'deliveryType' => $order['delivery_type'] ?? 'pickup',
        'deliveryInfo' => [
            'name' => $order['name'] ?? '',
            'email' => $order['email'] ?? '',
            'phone' => $order['phone'] ?? '',
            'address' => $order['address'] ?? '',
            'city' => $order['city'] ?? '',
            'zip' => $order['zip'] ?? '',
            'note' => $order['note'] ?? ''
        ],
        'totalPrice' => (float)$order['total_price'],
        'status' => $order['status'] ?? 'pending',
        'paymentStatus' => $paymentStatus,
        'paymentMethod' => $order['payment_method'] ?? 'cash',
        'barionPaymentId' => $order['barion_payment_id'] ?? null,
        'createdAt' => $order['created_at'],
        'updatedAt' => $order['updated_at']
    ];
}

// GET /api/orders - Get all orders (admin)
if ($method === 'GET' && !preg_match('/\/[^\/]+$/', $path)) {
    $stmt = $db->query("
        SELECT * FROM orders 
        WHERE payment_method='cash' OR (payment_method='barion' AND status <> 'pending')
        ORDER BY created_at DESC
    ");
    $orders = $stmt->fetchAll();
    
    $itemsStmt = $db->query("
        SELECT oi.*, mi.title as foodTitle
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.item_id = mi.id
    ");
    $allItems = $itemsStmt->fetchAll();
    
    // Group items by order_id
    $itemsMap = [];
    foreach ($allItems as $item) {
        $orderId = $item['order_id'];
        if (!isset($itemsMap[$orderId])) {
            $itemsMap[$orderId] = [];
        }
        $itemsMap[$orderId][] = $item;
    }
    
    $result = [];
    foreach ($orders as $order) {
        $items = $itemsMap[$order['id']] ?? [];
        $result[] = buildOrderResponse($order, $items);
    }
    
    sendJSON($result);
}

// GET /api/orders/:id - Get single order
if ($method === 'GET' && preg_match('/\/([^\/]+)$/', $path, $matches)) {
    $id = $matches[1];
    
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    
    if (!$order) {
        sendJSON(['error' => 'Order not found'], 404);
    }
    
    $itemsStmt = $db->prepare("
        SELECT oi.*, mi.title as foodTitle
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.item_id = mi.id
        WHERE oi.order_id = ?
    ");
    $itemsStmt->execute([$id]);
    $items = $itemsStmt->fetchAll();
    
    sendJSON(buildOrderResponse($order, $items));
}

// POST /api/orders - Create new order
if ($method === 'POST' && !preg_match('/\/[^\/]+/', $path)) {
    $data = getJSONInput();
    
    // Check restaurant status
    $stmt = $db->prepare("SELECT setting_value FROM settings WHERE setting_key = ?");
    $stmt->execute(['manual_open']);
    $setting = $stmt->fetch();
    $manualOpen = $setting ? ($setting['setting_value'] === 'true') : true;
    
    // Get current time in Hungary timezone
    date_default_timezone_set('Europe/Budapest');
    $now = new DateTime();
    $currentDay = (int)$now->format('w'); // 0 = Sunday
    $currentTimeValue = (int)$now->format('H') * 60 + (int)$now->format('i');
    
    $dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'];
    $todayName = $dayNames[$currentDay];
    
    $hoursStmt = $db->prepare("SELECT * FROM open_hours WHERE name_of_day = ?");
    $hoursStmt->execute([$todayName]);
    $todayHours = $hoursStmt->fetch();
    
    $isOpenBySchedule = false;
    if ($todayHours) {
        $fromDate = new DateTime($todayHours['from_time']);
        $tilDate = new DateTime($todayHours['til_time']);
        
        $fromValue = (int)$fromDate->format('H') * 60 + (int)$fromDate->format('i');
        $tilValue = (int)$tilDate->format('H') * 60 + (int)$tilDate->format('i');
        
        if ($fromValue !== $tilValue) {
            $isOpenBySchedule = $currentTimeValue >= $fromValue && $currentTimeValue < $tilValue;
        }
    }
    
    $isOpen = $manualOpen && $isOpenBySchedule;
    
    if (!$isOpen) {
        sendJSON(['error' => 'Az étterem jelenleg zárva tart, rendelés nem adható le.'], 403);
    }
    
    // Extract order data
    $items = $data['items'] ?? [];
    $deliveryInfo = $data['deliveryInfo'] ?? [];
    $deliveryType = $data['deliveryType'] ?? 'pickup';
    $totalPrice = $data['totalPrice'] ?? 0;
    $paymentMethod = $data['paymentMethod'] ?? 'cash';
    $status = $data['status'] ?? 'pending';
    
    $name = $deliveryInfo['name'] ?? '';
    $email = $deliveryInfo['email'] ?? '';
    $phone = $deliveryInfo['phone'] ?? '';
    $address = $deliveryInfo['address'] ?? '';
    $city = $deliveryInfo['city'] ?? '';
    $zip = $deliveryInfo['zip'] ?? '';
    $note = $deliveryInfo['note'] ?? '';
    
    // Generate order ID
    $maxStmt = $db->query("SELECT MAX(id) as maxId FROM orders");
    $maxResult = $maxStmt->fetch();
    $orderId = ($maxResult && $maxResult['maxId']) ? (int)$maxResult['maxId'] + 1 : 1;
    
    // Insert order
    $orderStmt = $db->prepare("
        INSERT INTO orders (
            id, name, email, phone, delivery_type, address, city, zip, note,
            total_price, status, payment_method, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    ");
    $orderStmt->execute([
        $orderId, $name, $email, $phone, $deliveryType, $address, $city, $zip, $note,
        $totalPrice, $status, $paymentMethod
    ]);
    
    // Insert order items
    if (!empty($items)) {
        $itemStmt = $db->prepare("
            INSERT INTO order_items (order_id, item_id, item_title, quantity, price, extras, price_label)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($items as $item) {
            $extrasJson = null;
            if (isset($item['extras'])) {
                $extrasJson = is_string($item['extras']) ? $item['extras'] : json_encode($item['extras']);
            }
            
            $itemStmt->execute([
                $orderId,
                $item['itemId'] ?? $item['foodId'] ?? null,
                $item['foodTitle'] ?? $item['item_title'] ?? $item['title'] ?? 'Unknown Item',
                $item['quantity'] ?? 1,
                $item['price'] ?? 0,
                $extrasJson,
                $item['priceLabel'] ?? $item['price_label'] ?? null
            ]);
        }
    }
    
    // Fetch and return the created order
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$orderId]);
    $order = $stmt->fetch();
    
    $itemsStmt = $db->prepare("
        SELECT oi.*, mi.title as foodTitle
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.item_id = mi.id
        WHERE oi.order_id = ?
    ");
    $itemsStmt->execute([$orderId]);
    $orderItems = $itemsStmt->fetchAll();
    
    sendJSON(buildOrderResponse($order, $orderItems));
}

// PATCH /api/orders/:id - Update order
if ($method === 'PATCH' && preg_match('/\/([^\/]+)$/', $path, $matches)) {
    $id = $matches[1];
    $data = getJSONInput();
    
    $updates = [];
    $values = [];
    
    if (isset($data['paymentStatus'])) {
        if ($data['paymentStatus'] === 'paid') {
            $updates[] = 'status = ?';
            $values[] = 'paid';
        } elseif ($data['paymentStatus'] === 'failed') {
            $updates[] = 'status = ?';
            $values[] = 'cancelled';
        } elseif ($data['paymentStatus'] === 'pending') {
            $updates[] = 'status = ?';
            $values[] = 'pending';
        }
    } elseif (isset($data['status'])) {
        $updates[] = 'status = ?';
        $values[] = $data['status'];
    }
    
    if (empty($updates)) {
        sendJSON(['error' => 'No fields to update'], 400);
    }
    
    $values[] = $id;
    
    $sql = "UPDATE orders SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($values);
    
    // Return updated order
    $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $stmt->execute([$id]);
    $order = $stmt->fetch();
    
    if (!$order) {
        sendJSON(['error' => 'Order not found'], 404);
    }
    
    $itemsStmt = $db->prepare("
        SELECT oi.*, mi.title as foodTitle
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.item_id = mi.id
        WHERE oi.order_id = ?
    ");
    $itemsStmt->execute([$id]);
    $items = $itemsStmt->fetchAll();
    
    sendJSON(buildOrderResponse($order, $items));
}

// PUT /api/orders/:id/status - Update order status
if ($method === 'PUT' && preg_match('/\/([^\/]+)\/status$/', $path, $matches)) {
    $id = $matches[1];
    $data = getJSONInput();
    $status = $data['status'] ?? null;
    
    $validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!$status || !in_array($status, $validStatuses)) {
        sendJSON(['error' => 'Invalid status'], 400);
    }
    
    $stmt = $db->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
    $stmt->execute([$status, $id]);
    
    sendJSON(['success' => true, 'orderId' => $id, 'status' => $status]);
}

sendJSON(['error' => 'Not found'], 404);
?>
