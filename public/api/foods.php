<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// Helper function to build prices for a food item
function buildPricesForFood($food, $priceRows) {
    $prices = [];
    
    if (!empty($priceRows)) {
        foreach ($priceRows as $row) {
            $prices[] = [
                'label' => $row['label'],
                'price' => (float)$row['price']
            ];
        }
        return $prices;
    }
    
    // Fallback to food price if no price rows
    if (isset($food['price'])) {
        return [['label' => 'Alap', 'price' => (float)$food['price']]];
    }
    
    return [];
}

// GET /api/foods - Get all foods
if ($method === 'GET' && !preg_match('/\/(\d+)/', $path)) {
    $stmt = $db->query("
        SELECT menu_items.*, categories.title AS categoryTitle
        FROM menu_items
        LEFT JOIN categories ON menu_items.category_Id = categories.id
    ");
    $foods = $stmt->fetchAll();
    
    // Fetch all prices
    $priceStmt = $db->query("SELECT * FROM item_prices");
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
    
    // Build full foods array with prices
    $fullFoods = [];
    foreach ($foods as $food) {
        $foodId = $food['id'];
        $prices = buildPricesForFood($food, $priceMap[$foodId] ?? []);
        
        $fullFoods[] = [
            'id' => (int)$food['id'],
            'title' => $food['title'],
            'description' => $food['description'],
            'image' => $food['image'],
            'category_id' => (int)$food['category_id'],
            'categoryId' => (int)$food['category_id'],
            'categoryTitle' => $food['categoryTitle'] ?? '',
            'active' => (int)$food['active'],
            'prices' => $prices,
            'badges' => []
        ];
    }
    
    sendJSON($fullFoods);
}

// GET /api/foods/:id - Get single food
if ($method === 'GET' && preg_match('/\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    
    $stmt = $db->prepare("SELECT * FROM menu_items WHERE id = ?");
    $stmt->execute([$id]);
    $food = $stmt->fetch();
    
    if (!$food) {
        sendJSON(['error' => 'Food not found'], 404);
    }
    
    $priceStmt = $db->prepare("SELECT * FROM item_prices WHERE item_id = ?");
    $priceStmt->execute([$id]);
    $priceRows = $priceStmt->fetchAll();
    
    $prices = buildPricesForFood($food, $priceRows);
    
    sendJSON([
        'id' => (int)$food['id'],
        'title' => $food['title'],
        'description' => $food['description'],
        'image' => $food['image'],
        'category_id' => (int)$food['category_id'],
        'categoryId' => (int)$food['category_id'],
        'active' => (int)$food['active'],
        'prices' => $prices,
        'badges' => []
    ]);
}

// POST /api/foods - Create new food
if ($method === 'POST' && !preg_match('/\/\d+/', $path)) {
    $data = $_POST; // For multipart/form-data
    
    // Handle image upload
    $imagePath = '/placeholder.png';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../static_images/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $filename = time() . '-' . rand(100000, 999999) . '.' . pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $uploadPath = $uploadDir . $filename;
        move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath);
        $imagePath = '/static_images/' . $filename;
    } elseif (isset($data['image'])) {
        $imagePath = $data['image'];
    }
    
    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $categoryId = $data['categoryId'] ?? 1;
    $active = $data['active'] ?? 1;
    $prices = isset($data['prices']) ? json_decode($data['prices'], true) : [];
    
    $stmt = $db->prepare("
        INSERT INTO menu_items (title, description, image, category_id, active)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$title, $description, $imagePath, $categoryId, $active]);
    $foodId = $db->lastInsertId();
    
    // Insert prices
    if (!empty($prices)) {
        $priceStmt = $db->prepare("INSERT INTO item_prices (item_id, label, price) VALUES (?, ?, ?)");
        foreach ($prices as $price) {
            $priceStmt->execute([$foodId, $price['label'], $price['price']]);
        }
    }
    
    sendJSON([
        'id' => (int)$foodId,
        'title' => $title,
        'description' => $description,
        'image' => $imagePath,
        'categoryId' => (int)$categoryId,
        'active' => (int)$active,
        'prices' => $prices,
        'badges' => []
    ]);
}

// PUT /api/foods/:id - Update food
if ($method === 'PUT' && preg_match('/\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    $data = $_POST;
    
    // Handle image upload
    $imagePath = $data['image'] ?? null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = __DIR__ . '/../static_images/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $filename = time() . '-' . rand(100000, 999999) . '.' . pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $uploadPath = $uploadDir . $filename;
        move_uploaded_file($_FILES['image']['tmp_name'], $uploadPath);
        $imagePath = '/static_images/' . $filename;
    }
    
    $title = $data['title'];
    $description = $data['description'];
    $categoryId = $data['categoryId'];
    $active = $data['active'] ?? 1;
    $prices = isset($data['prices']) ? json_decode($data['prices'], true) : [];
    
    $stmt = $db->prepare("
        UPDATE menu_items SET title = ?, description = ?, image = ?, category_id = ?, active = ?
        WHERE id = ?
    ");
    $stmt->execute([$title, $description, $imagePath, $categoryId, $active, $id]);
    
    // Update prices
    $db->prepare("DELETE FROM item_prices WHERE item_id = ?")->execute([$id]);
    if (!empty($prices)) {
        $priceStmt = $db->prepare("INSERT INTO item_prices (item_id, label, price) VALUES (?, ?, ?)");
        foreach ($prices as $price) {
            $priceStmt->execute([$id, $price['label'], $price['price']]);
        }
    }
    
    sendJSON([
        'id' => (int)$id,
        'title' => $title,
        'description' => $description,
        'image' => $imagePath,
        'categoryId' => (int)$categoryId,
        'active' => (int)$active,
        'prices' => $prices,
        'badges' => []
    ]);
}

// DELETE /api/foods/:id - Delete food
if ($method === 'DELETE' && preg_match('/\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    
    $stmt = $db->prepare("DELETE FROM menu_items WHERE id = ?");
    $stmt->execute([$id]);
    
    sendJSON(['success' => true]);
}

// PATCH /api/foods/:id/toggle-active - Toggle active status
if ($method === 'PATCH' && preg_match('/\/(\d+)\/toggle-active$/', $path, $matches)) {
    $id = $matches[1];
    
    $stmt = $db->prepare("UPDATE menu_items SET active = IF(active = 1, 0, 1) WHERE id = ?");
    $stmt->execute([$id]);
    
    sendJSON(['success' => true]);
}

sendJSON(['error' => 'Not found'], 404);
?>
