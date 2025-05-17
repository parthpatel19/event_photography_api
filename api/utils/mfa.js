const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate MFA secret
const generateMFASecret = async () => {
    const secret = speakeasy.generateSecret({
        name: 'Event Photography API'
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
        secret: secret.base32,
        qrCode
    };
};

// Verify MFA token
const verifyMFAToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1 // Allow 30 seconds clock skew
    });
};

module.exports = {
    generateMFASecret,
    verifyMFAToken
}; 