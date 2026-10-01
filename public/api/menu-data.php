<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('X-Content-Type-Options: nosniff');

$configPath = __DIR__ . '/config.local.php';
$config = is_file($configPath) ? require $configPath : [
    'host' => getenv('DB_HOST') ?: 'localhost',
    'port' => getenv('DB_PORT') ?: '3306',
    'database' => getenv('DB_DATABASE') ?: '',
    'username' => getenv('DB_USERNAME') ?: '',
    'password' => getenv('DB_PASSWORD') ?: '',
    'admin_pin' => getenv('MEATPORT_ADMIN_PIN') ?: '0000',
];
$seedPath = dirname(__DIR__) . '/tenants/meatport/database_dump.json';

function sendJson(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') return [];
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) sendJson(400, ['success' => false, 'error' => 'Invalid JSON body']);
    return $decoded;
}

function managerPinIsValid(array $body, array $config): bool
{
    $headers = function_exists('getallheaders') ? getallheaders() : [];
    $providedPin = (string)($headers['X-Admin-Pin'] ?? $headers['x-admin-pin'] ?? $body['pin'] ?? '');
    return hash_equals((string)($config['admin_pin'] ?? ''), $providedPin);
}

function openDatabase(array $config): PDO
{
    foreach (['host', 'database', 'username', 'password'] as $key) {
        if (!isset($config[$key]) || (string)$config[$key] === '') sendJson(503, ['success' => false, 'error' => 'MySQL is not configured']);
    }
    if (!extension_loaded('pdo_mysql')) sendJson(500, ['success' => false, 'error' => 'PDO MySQL is not enabled on the server']);
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $config['host'], $config['port'] ?? '3306', $config['database']);
    $db = new PDO($dsn, (string)$config['username'], (string)$config['password'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, PDO::ATTR_EMULATE_PREPARES => false]);
    $db->exec("CREATE TABLE IF NOT EXISTS menu_categories (id VARCHAR(191) PRIMARY KEY, tenant_id VARCHAR(191) NOT NULL, display_order INT NOT NULL DEFAULT 0, is_visible TINYINT(1) NOT NULL DEFAULT 1, payload LONGTEXT NOT NULL, updated_at DATETIME NOT NULL, INDEX idx_categories_tenant_order (tenant_id, display_order)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec("CREATE TABLE IF NOT EXISTS menu_products (id VARCHAR(191) PRIMARY KEY, tenant_id VARCHAR(191) NOT NULL, category_id VARCHAR(191) NOT NULL, name_en VARCHAR(255) NOT NULL, name_ar VARCHAR(255) NOT NULL, price DECIMAL(10,2) NOT NULL DEFAULT 0, display_order INT NOT NULL DEFAULT 0, is_visible TINYINT(1) NOT NULL DEFAULT 1, payload LONGTEXT NOT NULL, updated_at DATETIME NOT NULL, INDEX idx_products_tenant_order (tenant_id, display_order), INDEX idx_products_category (category_id)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $db->exec("CREATE TABLE IF NOT EXISTS menu_metadata (`key` VARCHAR(191) PRIMARY KEY, `value` TEXT NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    return $db;
}

function replaceMenu(PDO $db, array $categories, array $products): string
{
    $updatedAt = gmdate('Y-m-d H:i:s');
    $db->beginTransaction();
    try {
        $db->exec('DELETE FROM menu_categories');
        $db->exec('DELETE FROM menu_products');
        $categoryInsert = $db->prepare('INSERT INTO menu_categories (id, tenant_id, display_order, is_visible, payload, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
        foreach ($categories as $category) {
            if (!is_array($category) || empty($category['id'])) continue;
            $categoryInsert->execute([(string)$category['id'], (string)($category['tenantId'] ?? 't-1'), (int)($category['displayOrder'] ?? 0), !empty($category['isVisible']) ? 1 : 0, json_encode($category, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $updatedAt]);
        }
        $productInsert = $db->prepare('INSERT INTO menu_products (id, tenant_id, category_id, name_en, name_ar, price, display_order, is_visible, payload, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($products as $product) {
            if (!is_array($product) || empty($product['id'])) continue;
            $productInsert->execute([(string)$product['id'], (string)($product['tenantId'] ?? 't-1'), (string)($product['categoryId'] ?? ''), (string)($product['nameEn'] ?? ''), (string)($product['nameAr'] ?? ''), (float)($product['price'] ?? 0), (int)($product['displayOrder'] ?? 0), !empty($product['isVisible']) ? 1 : 0, json_encode($product, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $updatedAt]);
        }
        $meta = $db->prepare('INSERT INTO menu_metadata (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)');
        $meta->execute(['updated_at', $updatedAt]);
        $db->commit();
        return $updatedAt;
    } catch (Throwable $error) {
        if ($db->inTransaction()) $db->rollBack();
        throw $error;
    }
}

function applyCashierMenuCorrections(array $products): array
{
    $prices = [
        'mp-p-057' => 22, 'mp-p-060' => 39, 'mp-p-062' => 22,
        'mp-p-new-fattoush' => 22, 'mp-p-042' => 19, 'mp-p-052' => 12,
        'mp-p-053' => 15, 'mp-p-027' => 48, 'mp-p-039' => 140,
        'mp-p-067' => 19, 'mp-p-078' => 59, 'mp-p-079' => 95, 'mp-p-081' => 35,
    ];
    foreach ($products as &$product) {
        if (!is_array($product) || empty($product['id'])) continue;
        $id = (string)$product['id'];
        if (isset($prices[$id])) {
            $price = (float)$prices[$id];
            $cost = (float)($product['costPrice'] ?? 0);
            $profit = max(0, $price - $cost);
            $product['price'] = $price;
            $product['profit'] = $profit;
            $product['margin'] = $price > 0 ? ($profit / $price) * 100 : 0;
        }
        if ($id === 'mp-p-067') {
            $product['nameEn'] = 'CHEF SOUP';
            $product['nameAr'] = 'شوربة الشيف';
            $product['descriptionEn'] = "Chef's daily soup.";
            $product['descriptionAr'] = 'شوربة الشيف اليومية.';
            $product['isVisible'] = true;
        }
        if ($id === 'mp-p-069' || $id === 'mp-p-070') $product['isVisible'] = false;
    }
    unset($product);
    return $products;
}

function seedIfEmpty(PDO $db, string $seedPath): void
{
    $count = (int)$db->query('SELECT COUNT(*) FROM menu_products')->fetchColumn();
    if ($count > 0 || !is_file($seedPath)) return;
    $seed = json_decode((string)file_get_contents($seedPath), true);
    if (is_array($seed) && isset($seed['categories'], $seed['products'])) replaceMenu($db, $seed['categories'], applyCashierMenuCorrections($seed['products']));
}

function readSettings(PDO $db): array
{
    $raw = $db->query("SELECT `value` FROM menu_metadata WHERE `key` = 'settings'")->fetchColumn();
    $decoded = $raw ? json_decode((string)$raw, true) : null;
    $defaults = ['nationalDayTheme' => false];
    return is_array($decoded) ? array_merge($defaults, $decoded) : $defaults;
}

function saveSettings(PDO $db, array $settings): array
{
    $current = readSettings($db);
    $merged = array_merge($current, $settings);
    $meta = $db->prepare('INSERT INTO menu_metadata (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)');
    $meta->execute(['settings', json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
    return $merged;
}

try {
    $db = openDatabase($config);
    seedIfEmpty($db, $seedPath);
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $categories = array_map(static fn(array $row) => json_decode($row['payload'], true), $db->query('SELECT payload FROM menu_categories ORDER BY display_order, id')->fetchAll());
        $products = array_map(static fn(array $row) => json_decode($row['payload'], true), $db->query('SELECT payload FROM menu_products ORDER BY display_order, id')->fetchAll());
        $updatedAt = $db->query("SELECT `value` FROM menu_metadata WHERE `key` = 'updated_at'")->fetchColumn() ?: null;
        sendJson(200, ['categories' => $categories, 'products' => $products, 'updatedAt' => $updatedAt, 'settings' => readSettings($db), 'storage' => 'mysql']);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        header('Allow: GET, POST');
        sendJson(405, ['success' => false, 'error' => 'Method not allowed']);
    }
    $body = readJsonBody();
    if (!managerPinIsValid($body, $config)) sendJson(401, ['success' => false, 'error' => 'Invalid manager PIN']);
    if (($body['action'] ?? '') === 'login') sendJson(200, ['success' => true, 'storage' => 'mysql']);
    if (isset($body['settings']) && is_array($body['settings']) && !isset($body['categories'])) {
        $settings = saveSettings($db, $body['settings']);
        sendJson(200, ['success' => true, 'settings' => $settings, 'storage' => 'mysql']);
    }
    if (!isset($body['categories'], $body['products']) || !is_array($body['categories']) || !is_array($body['products'])) sendJson(422, ['success' => false, 'error' => 'Categories and products must be arrays']);
    $updatedAt = replaceMenu($db, $body['categories'], $body['products']);
    $settings = isset($body['settings']) && is_array($body['settings']) ? saveSettings($db, $body['settings']) : readSettings($db);
    sendJson(200, ['success' => true, 'updatedAt' => $updatedAt, 'settings' => $settings, 'storage' => 'mysql']);
} catch (Throwable $error) {
    error_log('Menu database error: ' . $error->getMessage());
    $driverCode = $error instanceof PDOException && isset($error->errorInfo[1]) ? (int)$error->errorInfo[1] : 0;
    $safeErrors = [
        1045 => 'MySQL username or password is incorrect',
        1049 => 'MySQL database name does not exist',
        2002 => 'MySQL host is unavailable',
        2003 => 'MySQL connection was refused',
    ];
    sendJson(500, [
        'success' => false,
        'error' => $safeErrors[$driverCode] ?? 'Menu database operation failed',
        'code' => $driverCode ?: 'UNKNOWN',
    ]);
}
