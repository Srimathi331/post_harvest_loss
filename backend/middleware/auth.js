const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "postharvest_secret_key";

/**
 * Verify JWT from Authorization header.
 * Attaches decoded payload to req.user.
 * Returns 401 if missing or invalid.
 */
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Require one of the specified roles.
 * Must be used after verifyJWT.
 * Returns 403 if role does not match.
 */
const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
};

/**
 * Issue a JWT for a user.
 */
const issueJWT = (user) => {
  const expiresIn = ["policymaker"].includes(user.role) ? "8h" : "24h";
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn }
  );
};

module.exports = { verifyJWT, requireRole, issueJWT };
