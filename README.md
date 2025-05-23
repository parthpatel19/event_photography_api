# Event Photography API

A Node.js API for event photography management with role-based authentication and team management.

## Features

- Role-based authentication (Studio/Agency and Team Member)
- Multi-factor authentication (MFA)
- Email verification
- Password recovery
- Team management
- Portfolio management

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- SMTP server for email functionality

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event_photography_api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/event_photography

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d

# Email Configuration
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@example.com
```

4. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

#### Studio Registration
```http
POST /api/v1/auth/studio/register
Content-Type: application/json

{
    "studioName": "Example Studio",
    "email": "studio@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "location": {
        "address": "123 Main St",
        "city": "Example City",
        "state": "Example State",
        "country": "Example Country",
        "zipCode": "12345"
    },
    "licenseNumber": "LIC123456"
}
```

#### Team Member Registration
```http
POST /api/v1/auth/team-member/register
Content-Type: application/json
Authorization: Bearer <studio_token>

{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "photographer",
    "specialization": ["candid", "wedding"]
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123",
    "role": "studio" // or "team_member"
}
```

#### MFA Verification
```http
POST /api/v1/auth/verify-mfa
Content-Type: application/json

{
    "mfaToken": "token_from_login",
    "mfaCode": "123456"
}
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
    "email": "user@example.com",
    "role": "studio" // or "team_member"
}
```

#### Reset Password
```http
PATCH /api/v1/auth/reset-password/:token
Content-Type: application/json

{
    "password": "new_password123"
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- MFA support using TOTP (Time-based One-Time Password)
- Email verification
- Password recovery via email
- Role-based access control

## Error Handling

The API uses a consistent error response format:
```json
{
    "status": "error",
    "message": "Error message"
}
```

## Success Response Format

Successful responses follow this format:
```json
{
    "status": "success",
    "data": {
        // Response data
    }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.