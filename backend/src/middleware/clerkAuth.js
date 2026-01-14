const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// This middleware enforces authentication.
// It will throw a 401 if the token is invalid or missing.
// It adds req.auth to the request object.
const clerkAuth = ClerkExpressRequireAuth({
  /* Options */
  // We can add specific options here if needed, but defaults are usually fine
  // provided CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY are in env variables.
});

module.exports = clerkAuth;
