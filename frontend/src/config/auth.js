// Policymaker authentication config
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

const POLICYMAKER_USERS = [
  {
    username: "admin",
    password: "admin123",
    role: "policymaker",
  },
];

export const validatePolicymakerCredentials = (username, password) => {
  const user = POLICYMAKER_USERS.find(
    (u) => u.username === username && u.password === password
  );
  return user || null;
};
