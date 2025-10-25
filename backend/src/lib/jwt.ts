import { JWTPayload, SignJWT, jwtVerify } from "jose";

export async function generateToken(payload: any) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    if (!token) return null;

    const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    const { payload } = await jwtVerify(actualToken, secret);

    return payload;
  } catch (error) {
    console.error("Invalid JWT token");
    return null;
  }
}
