import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string): Promise<boolean> => {
    const hashedPassword = await hashPassword(password);
    return bcrypt.compare(password, hashedPassword);
};