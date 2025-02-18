import jwt from 'jsonwebtoken'

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.userId
  } catch (error) {
    console.error('Token Verification error:', error)
    return null
  }
}

export const isTokenValid = (token) => {
  if (!token) return false

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const currentTime = Date.now() / 1000
    return decoded.exp > currentTime
  } catch (error) {
    return false
  }
}