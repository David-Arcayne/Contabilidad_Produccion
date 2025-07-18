<?php
// archivo: upload_pdf.php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $targetDir = __DIR__ . '/pdfs/';
    $targetFile = $targetDir . basename($_FILES['file']['name']);

    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetFile)) {
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'No se pudo guardar el archivo']);
    }
}
?>
