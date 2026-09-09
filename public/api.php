<?php
// Placeholder endpoint — reserved for the host's expected file structure.
// No server-side functionality is wired up yet: the site is fully static,
// and its forms currently hand off to the visitor's own mail client
// (see src/components/ContactForm.tsx and Footer.tsx). Wire real handling
// (e.g. a PHP mailer) here if/when the forms should submit server-side
// instead.

header('Content-Type: application/json');
http_response_code(501);
echo json_encode(['status' => 'not_implemented']);
