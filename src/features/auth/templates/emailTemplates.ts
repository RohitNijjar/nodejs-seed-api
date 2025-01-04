export const emailVerificationTemplate = (verificationUrl: string): string => `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address.</p>
    <a href="${verificationUrl}">Verify Email</a>
`;

export const forgotPasswordTemplate = (resetPasswordUrl: string): string => `
    <h1>Reset Your Password</h1>
    <p>Please click the link below to reset your password.</p>
    <a href="${resetPasswordUrl}">Reset Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
`;
