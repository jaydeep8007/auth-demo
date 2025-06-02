
import * as bcrypt from 'bcrypt';

const saltRounds = 10;

/* ✅ HASH PASSWORD USING ONLY BCRYPT */
export async function hashPassword(password: string): Promise<string> {
    const bcryptHash = await bcrypt.hash(password, saltRounds);
    return bcryptHash;
}

/* ✅ COMPARE PASSWORD USING ONLY BCRYPT */
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const match = await bcrypt.compare(plainPassword, hashedPassword);
    return match;
}