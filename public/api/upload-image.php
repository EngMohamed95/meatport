<?php
declare(strict_types=1);

// Live equivalent of the Vite dev middleware for image uploads / gallery listing.
//   GET  /api/upload-image.php            -> { success, images: [...] }
//   POST /api/upload-image.php  (JSON { fileName, base64Data }, header X-Admin-Pin)
//                                          -> { success, url }

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('X-Content-Type-Options: nosniff');

$configPath = __DIR__ . '/config.local.php';
$config = is_file($configPath) ? require $configPath : [
    'admin_pin' => getenv('MEATPORT_ADMIN_PIN') ?: '0000',
];

$productsDir = dirname(__DIR__) . '/tenants/meatport/assets/products';
$publicPrefix = '/tenants/meatport/assets/products/';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB decoded

function respond(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function ensureDir(string $dir): void
{
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        respond(500, ['success' => false, 'error' => 'Unable to create upload directory']);
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        ensureDir($productsDir);
        $files = array_values(array_filter(scandir($productsDir) ?: [], static fn($f) => (bool)preg_match('/\.(jpe?g|png|gif|webp)$/i', $f)));
        usort($files, static fn($a, $b) => filemtime("$productsDir/$b") <=> filemtime("$productsDir/$a"));
        respond(200, ['success' => true, 'images' => array_map(static fn($f) => $publicPrefix . $f, $files)]);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Allow: GET, POST');
        respond(405, ['success' => false, 'error' => 'Method not allowed']);
    }

    $raw = file_get_contents('php://input');
    $body = is_string($raw) ? json_decode($raw, true) : null;
    if (!is_array($body)) respond(400, ['success' => false, 'error' => 'Invalid JSON body (file may exceed server upload limit)']);

    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $providedPin = (string)($headers['X-Admin-Pin'] ?? $headers['x-admin-pin'] ?? $_SERVER['HTTP_X_ADMIN_PIN'] ?? $body['pin'] ?? '');
    if (!hash_equals((string)($config['admin_pin'] ?? ''), $providedPin)) {
        respond(401, ['success' => false, 'error' => 'Invalid manager PIN']);
    }

    $fileName = (string)($body['fileName'] ?? '');
    $base64Data = (string)($body['base64Data'] ?? '');
    if ($fileName === '' || $base64Data === '') respond(422, ['success' => false, 'error' => 'Missing fileName or base64Data']);

    $pos = strpos($base64Data, ';base64,');
    $binary = base64_decode($pos === false ? $base64Data : substr($base64Data, $pos + 8), true);
    if ($binary === false || $binary === '') respond(422, ['success' => false, 'error' => 'Invalid image data']);
    if (strlen($binary) > MAX_UPLOAD_BYTES) respond(413, ['success' => false, 'error' => 'Image is larger than 8 MB']);

    // Validate actual content, not just the extension.
    $info = @getimagesizefromstring($binary);
    $allowed = [IMAGETYPE_JPEG => 'jpg', IMAGETYPE_PNG => 'png', IMAGETYPE_GIF => 'gif', IMAGETYPE_WEBP => 'webp'];
    if ($info === false || !isset($allowed[$info[2]])) respond(415, ['success' => false, 'error' => 'Only JPG, PNG, GIF or WEBP images are allowed']);
    $ext = $allowed[$info[2]];

    $base = pathinfo($fileName, PATHINFO_FILENAME);
    $base = trim((string)preg_replace('/[^a-zA-Z0-9-]+/', '_', $base), '_') ?: 'image';
    $base = substr($base, 0, 80);

    ensureDir($productsDir);
    $safeName = "$base.$ext";
    if (file_exists("$productsDir/$safeName")) $safeName = $base . '-' . date('YmdHis') . ".$ext";

    if (file_put_contents("$productsDir/$safeName", $binary, LOCK_EX) === false) {
        respond(500, ['success' => false, 'error' => 'Unable to write image file (check folder permissions)']);
    }
    @chmod("$productsDir/$safeName", 0644);

    respond(200, ['success' => true, 'url' => $publicPrefix . $safeName]);
} catch (Throwable $error) {
    error_log('Image upload error: ' . $error->getMessage());
    respond(500, ['success' => false, 'error' => 'Image upload failed']);
}
