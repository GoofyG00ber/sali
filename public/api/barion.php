<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

// POST /api/barion/check-payment - Check Barion payment status
if ($method === 'POST' && strpos($path, '/check-payment') !== false) {
    $data = getJSONInput();
    $paymentId = $data['paymentId'] ?? null;
    
    if (!$paymentId) {
        sendJSON(['error' => 'Missing paymentId'], 400);
    }
    
    // Call Barion GetPaymentState API
    $posKey = BARION_POS_KEY;
    $barionUrl = "https://api.test.barion.com/v2/Payment/GetPaymentState?POSKey=$posKey&PaymentId=$paymentId";
    
    $ch = curl_init($barionUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode !== 200) {
        sendJSON(['error' => 'Barion API error'], 400);
    }
    
    $result = json_decode($response, true);
    
    // Check for Barion API errors
    if (isset($result['Errors']) && !empty($result['Errors'])) {
        sendJSON(['error' => 'Barion API error', 'details' => $result['Errors']], 400);
    }
    
    // If payment is successful, update order status
    if (isset($result['Status']) && $result['Status'] === 'Succeeded') {
        $paymentRequestId = $result['PaymentRequestId'] ?? null;
        
        if ($paymentRequestId) {
            $db = getDB();
            
            // Check if order is already confirmed
            $stmt = $db->prepare("SELECT status FROM orders WHERE id = ?");
            $stmt->execute([$paymentRequestId]);
            $order = $stmt->fetch();
            
            if ($order && $order['status'] !== 'confirmed') {
                // Update order status to confirmed
                $updateStmt = $db->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
                $updateStmt->execute(['confirmed', $paymentRequestId]);
                
                // Store Barion Payment ID if column exists
                try {
                    $colStmt = $db->query("SHOW COLUMNS FROM orders LIKE 'barion_payment_id'");
                    if ($colStmt->rowCount() > 0) {
                        $barionStmt = $db->prepare("UPDATE orders SET barion_payment_id = ? WHERE id = ?");
                        $barionStmt->execute([$paymentId, $paymentRequestId]);
                    }
                } catch (Exception $e) {
                    // Ignore if column doesn't exist
                }
            }
        }
    }
    
    sendJSON($result);
}

// POST /api/barion/callback - Barion callback endpoint
if ($method === 'POST' && strpos($path, '/callback') !== false) {
    $data = getJSONInput();
    
    $paymentId = $data['PaymentId'] ?? $data['paymentId'] ?? null;
    $paymentRequestId = $data['PaymentRequestId'] ?? $data['paymentRequestId'] ?? null;
    $state = $data['State'] ?? $data['state'] ?? $data['Status'] ?? null;
    
    if (!$paymentRequestId) {
        sendJSON(['error' => 'Missing PaymentRequestId'], 400);
    }
    
    $db = getDB();
    
    if ($state === 'Succeeded') {
        // Check if already confirmed
        $stmt = $db->prepare("SELECT status FROM orders WHERE id = ?");
        $stmt->execute([$paymentRequestId]);
        $order = $stmt->fetch();
        
        if ($order && $order['status'] !== 'confirmed') {
            // Update to confirmed
            $updateStmt = $db->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
            $updateStmt->execute(['confirmed', $paymentRequestId]);
            
            // Store Barion Payment ID
            try {
                $colStmt = $db->query("SHOW COLUMNS FROM orders LIKE 'barion_payment_id'");
                if ($colStmt->rowCount() > 0) {
                    $barionStmt = $db->prepare("UPDATE orders SET barion_payment_id = ? WHERE id = ?");
                    $barionStmt->execute([$paymentId, $paymentRequestId]);
                }
            } catch (Exception $e) {
                // Ignore
            }
        }
    } elseif (in_array($state, ['Canceled', 'Expired', 'Failed'])) {
        // Mark as cancelled
        $updateStmt = $db->prepare("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?");
        $updateStmt->execute(['cancelled', $paymentRequestId]);
    }
    
    sendJSON(['ok' => true]);
}

sendJSON(['error' => 'Not found'], 404);
?>
