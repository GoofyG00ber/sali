<?php
require_once 'config.php';

$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// GET /api/categories - Get all categories
if ($method === 'GET' && !preg_match('/\/(\d+)/', $path)) {
    $stmt = $db->query("SELECT * FROM categories");
    $categories = $stmt->fetchAll();
    
    $result = [];
    foreach ($categories as $cat) {
        $result[] = [
            'id' => (int)$cat['id'],
            'title' => $cat['title'],
            'image' => $cat['image']
        ];
    }
    
    sendJSON($result);
}

// GET /api/categories/:id - Get single category
if ($method === 'GET' && preg_match('/\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    
    $stmt = $db->prepare("SELECT * FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $cat = $stmt->fetch();
    
    if (!$cat) {
        sendJSON(['error' => 'Category not found'], 404);
    }
    
    sendJSON([
        'id' => (int)$cat['id'],
        'title' => $cat['title'],
        'image' => $cat['image']
    ]);
}

// POST /api/categories - Create category
if ($method === 'POST' && !preg_match('/\/\d+/', $path)) {
    $data = getJSONInput();
    
    $stmt = $db->prepare("INSERT INTO categories (title, image) VALUES (?, ?)");
    $stmt->execute([$data['title'], $data['image']]);
    $id = $db->lastInsertId();
    
    sendJSON([
        'id' => (int)$id,
        'title' => $data['title'],
        'image' => $data['image']
    ]);
}

// PUT /api/categories/:id - Update category
if ($method === 'PUT' && preg_match('/\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    $data = getJSONInput();
    
    $stmt = $db->prepare("UPDATE categories SET title = ?, image = ? WHERE id = ?");
    $stmt->execute([$data['title'], $data['image'], $id]);
    
    sendJSON([
        'id' => (int)$id,
        'title' => $data['title'],
        'image' => $data['image']
    ]);
}

// DELETE /api/categories/:id - Delete category
if ($method === 'DELETE' && preg_match('/\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    
    $stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    
    sendJSON(['success' => true]);
}

sendJSON(['error' => 'Not found'], 404);
?>
