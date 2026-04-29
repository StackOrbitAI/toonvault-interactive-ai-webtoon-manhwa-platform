const axios = require('axios');

async function testBackend() {
  try {
    const res = await axios.get('http://localhost:5000/api/settings/public');
    console.log('Backend public settings:', res.data);
  } catch (e) {
    console.error('Backend connection failed:', e.message);
  }
}

testBackend();
