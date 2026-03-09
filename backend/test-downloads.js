const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

// Admin credentials
const adminCredentials = {
  email: 'lycaonstaff123@gmail.com',
  password: 'ABCabc123#@'
};

async function testDownloads() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🧪 TESTING DOWNLOAD ENDPOINTS');
    console.log('='.repeat(70));

    // Step 1: Login as admin
    console.log('\n1️⃣  Logging in as admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminCredentials)
    });
    const loginData = await loginResponse.json();
    const adminToken = loginData.token;
    console.log('✅ Login successful');
    console.log('Token:', adminToken.substring(0, 50) + '...');

    // Step 2: Get all events
    console.log('\n2️⃣  Fetching events...');
    const eventsResponse = await fetch(`${API_URL}/admin/events`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const eventsData = await eventsResponse.json();
    const events = eventsData.events || eventsData;
    console.log('✅ Found', events.length, 'events');

    if (events.length === 0) {
      console.log('❌ No events found. Please create an event first.');
      return;
    }

    const eventId = events[0]._id;
    console.log('Using event:', events[0].title, '(ID:', eventId + ')');

    // Step 3: Test CSV download
    console.log('\n3️⃣  Testing CSV download...');
    try {
      const csvResponse = await fetch(
        `${API_URL}/admin/events/${eventId}/download-csv`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      if (!csvResponse.ok) {
        const errorText = await csvResponse.text();
        console.error('❌ CSV download failed');
        console.error('   Status:', csvResponse.status);
        console.error('   Response:', errorText);
      } else {
        const csvBuffer = await csvResponse.arrayBuffer();
        const csvPath = path.join(__dirname, 'test-report.csv');
        fs.writeFileSync(csvPath, Buffer.from(csvBuffer));
        const fileSize = fs.statSync(csvPath).size;
        console.log('✅ CSV downloaded successfully');
        console.log('   File size:', fileSize, 'bytes');
        console.log('   Saved to:', csvPath);

        // Display first 200 chars of CSV
        const csvContent = fs.readFileSync(csvPath, 'utf8');
        console.log('   Content preview:');
        console.log('   ', csvContent.substring(0, 150).replace(/\n/g, '\n    '));
      }
    } catch (err) {
      console.error('❌ CSV download error:', err.message);
    }

    // Step 4: Test PDF download
    console.log('\n4️⃣  Testing PDF download...');
    try {
      const pdfResponse = await fetch(
        `${API_URL}/admin/events/${eventId}/download-pdf`,
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text();
        console.error('❌ PDF download failed');
        console.error('   Status:', pdfResponse.status);
        console.error('   Response:', errorText);
      } else {
        const pdfBuffer = await pdfResponse.arrayBuffer();
        const pdfPath = path.join(__dirname, 'test-report.pdf');
        fs.writeFileSync(pdfPath, Buffer.from(pdfBuffer));
        const fileSize = fs.statSync(pdfPath).size;
        console.log('✅ PDF downloaded successfully');
        console.log('   File size:', fileSize, 'bytes');
        console.log('   Saved to:', pdfPath);
        
        // Check PDF header
        const header = Buffer.from(pdfBuffer).toString('ascii', 0, 10);
        console.log('   PDF Header:', header.split(/[\x00-\x1F]/)[0]);
      }
    } catch (err) {
      console.error('❌ PDF download error:', err.message);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ TEST COMPLETED');
    console.log('='.repeat(70) + '\n');
  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('❌ TEST FAILED');
    console.error('='.repeat(70));
    console.error('Error:', error.message);
    console.error('='.repeat(70) + '\n');
  }
}

testDownloads();
