// Debug authentication state
// Run this in browser console: copy & paste this code

console.log('🔍 Authentication Debug Info:');
console.log('===================================');

// Check localStorage tokens
const token = localStorage.getItem('access_token');
const expiresAt = localStorage.getItem('token_expires_at');

console.log('📋 Token Storage:');
console.log('  Token exists:', !!token);
console.log('  Token length:', token ? token.length : 'N/A');
console.log('  Token preview:', token ? token.substring(0, 20) + '...' : 'N/A');
console.log('  Expires at:', expiresAt);

if (expiresAt) {
  const expiry = new Date(expiresAt);
  const now = new Date();
  const isExpired = now >= expiry;
  const timeLeft = expiry.getTime() - now.getTime();

  console.log('⏰ Token Timing:');
  console.log('  Current time:', now.toISOString());
  console.log('  Expires at:', expiry.toISOString());
  console.log('  Is expired:', isExpired);
  console.log('  Time left:', isExpired ? 'EXPIRED' : `${Math.round(timeLeft/1000/60)} minutes`);
}

// Check if currently on login page
console.log('🌐 Current Location:');
console.log('  URL:', window.location.href);
console.log('  Pathname:', window.location.pathname);

// Test API connection
console.log('🔗 Testing API Connection:');
fetch('https://debtease-server.onrender.com/health')
  .then(response => response.json())
  .then(data => console.log('  Health check:', data))
  .catch(error => console.log('  Health check failed:', error));

console.log('===================================');
console.log('🎯 Recommended Actions:');
if (!token) {
  console.log('  ❌ No token found - Please log in');
} else if (expiresAt && new Date() >= new Date(expiresAt)) {
  console.log('  ⏰ Token expired - Please log in again');
  console.log('  💡 Run: localStorage.clear() then refresh');
} else {
  console.log('  ✅ Token looks valid - Check network/server');
}