<?php
header('Content-Type: application/json; charset=utf-8');

// Target recipient email
define("RECIPIENT_NAME", "Investors Club");
define("RECIPIENT_EMAIL", "investorclubofficial@gmail.com");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid request method.'
    ]);
    exit;
}

// Page 1: Personal Details
$name        = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$senderEmail = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$phone       = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';

// Page 2: Profile & Background
$age               = isset($_POST['age']) ? preg_replace('/[^0-9]/', '', $_POST['age']) : '';
$qualification     = isset($_POST['highest_qualification']) ? trim(strip_tags($_POST['highest_qualification'])) : '';
$otherQual         = isset($_POST['other_qualification']) ? trim(strip_tags($_POST['other_qualification'])) : '';
if ($qualification === 'Other' && !empty($otherQual)) {
    $qualification = 'Other: ' . $otherQual;
}

// Page 3: Collaboration & Investment Profile
$contributionModes = isset($_POST['contribution_modes']) && is_array($_POST['contribution_modes']) ? $_POST['contribution_modes'] : [];
$contributionList  = [];
foreach ($contributionModes as $mode) {
    $cleanMode = trim(strip_tags($mode));
    if ($cleanMode === 'Other') {
        $otherText = isset($_POST['contribution_other_text']) ? trim(strip_tags($_POST['contribution_other_text'])) : '';
        $contributionList[] = 'Other: ' . ($otherText ?: 'Custom');
    } else {
        $contributionList[] = $cleanMode;
    }
}
$contributionStr = !empty($contributionList) ? implode(', ', $contributionList) : 'None specified';

$engagementMode  = isset($_POST['engagement_mode']) ? trim(strip_tags($_POST['engagement_mode'])) : 'N/A';
$priorExperience = isset($_POST['prior_experience']) ? trim(strip_tags($_POST['prior_experience'])) : 'N/A';
$investmentRange = isset($_POST['investment_range']) ? trim(strip_tags($_POST['investment_range'])) : 'N/A';

// Page 4: Business Proposal & Ideas
$ideaDesc = isset($_POST['business_idea_description']) ? trim(strip_tags($_POST['business_idea_description'])) : 'None provided';

if (empty($name) || empty($senderEmail)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Please provide at least your Full Name and Email Address.'
    ]);
    exit;
}

// Subject
$mailSubject = "New Collaboration & Investment Profile Submission from " . $name;

// HTML Email Layout
$htmlBody = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: "Segoe UI", Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
        .email-container { max-width: 650px; background: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); }
        .email-header { background: #0B1F3A; color: #ffffff; padding: 25px 30px; }
        .email-header h2 { margin: 0; font-size: 20px; }
        .email-content { padding: 30px; color: #333333; line-height: 1.6; }
        .card-box { background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #4F7F3A; padding: 18px 20px; border-radius: 8px; margin-bottom: 20px; }
        .card-box h4 { margin: 0 0 10px 0; color: #0B1F3A; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .card-row { margin-bottom: 8px; font-size: 14px; }
        .card-row strong { color: #475569; display: inline-block; width: 220px; }
        .footer { background: #eef2f6; text-align: center; padding: 15px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h2>Investors Club - Profile & Investment Application</h2>
        </div>
        <div class="email-content">
            <div class="card-box">
                <h4>Page 1: Contact Information</h4>
                <div class="card-row"><strong>Full Name:</strong> ' . htmlspecialchars($name) . '</div>
                <div class="card-row"><strong>Email Address:</strong> <a href="mailto:' . htmlspecialchars($senderEmail) . '">' . htmlspecialchars($senderEmail) . '</a></div>
                <div class="card-row"><strong>Phone / WhatsApp:</strong> ' . htmlspecialchars($phone) . '</div>
            </div>

            <div class="card-box">
                <h4>Page 2: Background & Demographics</h4>
                <div class="card-row"><strong>Age:</strong> ' . htmlspecialchars($age) . '</div>
                <div class="card-row"><strong>Highest Qualification:</strong> ' . htmlspecialchars($qualification) . '</div>
            </div>

            <div class="card-box">
                <h4>Page 3: Investment & Value Contribution</h4>
                <div class="card-row"><strong>Contribution Mode(s):</strong> ' . htmlspecialchars($contributionStr) . '</div>
                <div class="card-row"><strong>Preferred Engagement:</strong> ' . htmlspecialchars($engagementMode) . '</div>
                <div class="card-row"><strong>Investment Range:</strong> ' . htmlspecialchars($investmentRange) . '</div>
                <div class="card-row" style="margin-top:12px;"><strong>Prior Business Experience:</strong><br>' . nl2br(htmlspecialchars($priorExperience)) . '</div>
            </div>

            <div class="card-box">
                <h4>Page 4: Business Concepts & Proposals</h4>
                <div class="card-row"><strong>Concept Overview:</strong><br>' . nl2br(htmlspecialchars($ideaDesc)) . '</div>
            </div>
        </div>
        <div class="footer">
            Delivered directly from the Investors Club Portal.
        </div>
    </div>
</body>
</html>';

$boundary = md5(time());

// File upload attachment inspection
$hasAttachment = false;
$attachmentData = '';
$attachmentName = '';
$attachmentType = '';

if (isset($_FILES['proposal_file']) && $_FILES['proposal_file']['error'] === UPLOAD_ERR_OK) {
    $hasAttachment = true;
    $attachmentName = basename($_FILES['proposal_file']['name']);
    $attachmentType = $_FILES['proposal_file']['type'];
    $fileContent    = file_get_contents($_FILES['proposal_file']['tmp_name']);
    $attachmentData = chunk_split(base64_encode($fileContent));
}

// Mail Headers
$headers  = "From: Investors Club Portal <no-reply@" . ($_SERVER['SERVER_NAME'] ?? 'investorsfactory.com') . ">\r\n";
$headers .= "Reply-To: " . $name . " <" . $senderEmail . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";

if ($hasAttachment) {
    $headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";

    $message  = "--{$boundary}\r\n";
    $message .= "Content-Type: text/html; charset=\"UTF-8\"\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $htmlBody . "\r\n\r\n";

    $message .= "--{$boundary}\r\n";
    $message .= "Content-Type: {$attachmentType}; name=\"{$attachmentName}\"\r\n";
    $message .= "Content-Disposition: attachment; filename=\"{$attachmentName}\"\r\n";
    $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $message .= $attachmentData . "\r\n\r\n";
    $message .= "--{$boundary}--";
} else {
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message  = $htmlBody;
}

$mailSent = @mail(RECIPIENT_EMAIL, $mailSubject, $message, $headers);

if ($mailSent) {
    echo json_encode([
        'status'  => 'success',
        'message' => 'Your application has been received and delivered directly to our inbox!'
    ]);
} else {
    echo json_encode([
        'status'  => 'fallback',
        'message' => 'Server fallback initiated.'
    ]);
}