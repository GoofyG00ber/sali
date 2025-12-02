<?php
require_once 'api/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = getJSONInput();
    
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $message = $data['message'] ?? '';
    
    if (empty($message) || empty($email)) {
        sendJSON(['error' => 'Missing required fields'], 400);
    }
    
    // Simple email sending using PHP mail() function
    // Note: For production, you might want to use PHPMailer or similar
    $recipient = 'orders@example.com'; // Change this to your email
    $subject = "Website message from " . ($name ?: $email);
    $body = "From: " . ($name ?: 'N/A') . " <$email>\n\n$message";
    $headers = "From: " . MAIL_FROM . "\r\n";
    $headers .= "Reply-To: $email\r\n";
    
    $result = mail($recipient, $subject, $body, $headers);
    
    if ($result) {
        sendJSON(['ok' => true, 'message' => 'Üzenet elküldve']);
    } else {
        sendJSON(['error' => 'Failed to send email'], 500);
    }
}

sendJSON(['error' => 'Method not allowed'], 405);
?>
