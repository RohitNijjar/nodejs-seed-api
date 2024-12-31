export const emailVerificationTemplate = (verificationUrl: string): string => `
    <h1>Verify Your Email</h1>
    <p>Please click the link below to verify your email address.</p>
    <a href="${verificationUrl}">Verify Email</a>
`;
