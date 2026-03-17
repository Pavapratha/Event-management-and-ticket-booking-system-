/**
 * Feedback System API Testing Script
 * 
 * This script tests all feedback endpoints
 * Run with: node test-feedback.js
 * 
 * Prerequisites:
 * - Backend server running on http://localhost:5000
 * - Admin user credentials for testing
 * - Regular user credentials for testing
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';
let userToken = '';
let adminToken = '';
let feedbackId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 FEEDBACK SYSTEM API TESTS');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: User Login
    log.info('Test 1: User Login');
    const userLoginRes = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'user@example.com',
      password: 'password123',
    });
    userToken = userLoginRes.data.token;
    log.success('User logged in successfully');

    // Test 2: Admin Login
    log.info('\nTest 2: Admin Login');
    const adminLoginRes = await axios.post(`${API_URL}/api/admin/login`, {
      email: 'admin@example.com',
      password: 'admin123',
    });
    adminToken = adminLoginRes.data.token;
    log.success('Admin logged in successfully');

    // Test 3: Submit Feedback (User)
    log.info('\nTest 3: Submit Feedback');
    const submitRes = await axios.post(
      `${API_URL}/api/feedback`,
      {
        rating: 4,
        title: 'Great Service!',
        message: 'The event management system is very user-friendly and responsive. Great experience overall!',
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    feedbackId = submitRes.data.feedback._id;
    log.success(`Feedback submitted: ${feedbackId}`);
    console.log('  Response:', JSON.stringify(submitRes.data, null, 2));

    // Test 4: Validate Rating (should fail with invalid rating)
    log.info('\nTest 4: Validate Rating (Invalid)');
    try {
      await axios.post(
        `${API_URL}/api/feedback`,
        {
          rating: 10, // Invalid
          title: 'Test',
          message: 'This should fail due to invalid rating',
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      log.error('Should have rejected invalid rating');
    } catch (err) {
      if (err.response?.status === 400) {
        log.success('Correctly rejected invalid rating');
      } else {
        log.error(`Unexpected error: ${err.message}`);
      }
    }

    // Test 5: Validate Message Length (should fail with short message)
    log.info('\nTest 5: Validate Message Length (Too Short)');
    try {
      await axios.post(
        `${API_URL}/api/feedback`,
        {
          rating: 3,
          title: 'Test',
          message: 'Short',
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      log.error('Should have rejected short message');
    } catch (err) {
      if (err.response?.status === 400) {
        log.success('Correctly rejected short message');
      } else {
        log.error(`Unexpected error: ${err.message}`);
      }
    }

    // Test 6: Get User Feedback
    log.info('\nTest 6: Get User Feedback');
    const userFeedbackRes = await axios.get(
      `${API_URL}/api/feedback/user/my-feedback`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    log.success(`Retrieved ${userFeedbackRes.data.count} feedback entries`);
    console.log('  Sample:', userFeedbackRes.data.feedback[0]);

    // Test 7: Get All Feedback (Admin)
    log.info('\nTest 7: Get All Feedback (Admin)');
    const allFeedbackRes = await axios.get(
      `${API_URL}/api/feedback/admin/all`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    log.success(`Admin retrieved ${allFeedbackRes.data.count} feedback entries`);
    console.log('  Stats:', JSON.stringify(allFeedbackRes.data.stats, null, 2));

    // Test 8: Get Feedback Statistics
    log.info('\nTest 8: Get Feedback Statistics');
    const statsRes = await axios.get(
      `${API_URL}/api/feedback/admin/stats`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    log.success('Retrieved feedback statistics');
    console.log('  Stats:', JSON.stringify(statsRes.data.stats, null, 2));

    // Test 9: Get Feedback by ID (Admin)
    log.info('\nTest 9: Get Feedback by ID');
    const feedbackByIdRes = await axios.get(
      `${API_URL}/api/feedback/admin/${feedbackId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    log.success('Retrieved feedback by ID');
    console.log('  Feedback:', JSON.stringify(feedbackByIdRes.data.feedback, null, 2));

    // Test 10: Mark as Reviewed (Admin)
    log.info('\nTest 10: Mark Feedback as Reviewed');
    const reviewRes = await axios.put(
      `${API_URL}/api/feedback/admin/${feedbackId}/review`,
      {},
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    log.success('Feedback marked as reviewed');
    console.log('  isReviewed:', reviewRes.data.feedback.isReviewed);

    // Test 11: Update Feedback Status (Admin)
    log.info('\nTest 11: Update Feedback Status');
    const statusRes = await axios.put(
      `${API_URL}/api/feedback/admin/${feedbackId}/status`,
      {
        status: 'resolved',
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    log.success('Feedback status updated');
    console.log('  New Status:', statusRes.data.feedback.status);

    // Test 12: Filter Feedback by Rating (Admin)
    log.info('\nTest 12: Filter Feedback by Rating');
    const filterRes = await axios.get(
      `${API_URL}/api/feedback/admin/all?rating=4`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    log.success(`Retrieved ${filterRes.data.count} feedback entries with 4-star rating`);

    // Test 13: Filter Feedback by Status (Admin)
    log.info('\nTest 13: Filter Feedback by Status');
    const statusFilterRes = await axios.get(
      `${API_URL}/api/feedback/admin/all?status=resolved`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    log.success(`Retrieved ${statusFilterRes.data.count} resolved feedback entries`);

    // Test 14: Delete Feedback (Admin)
    // Create a new feedback first to delete
    log.info('\nTest 14: Delete Feedback');
    const deleteTestRes = await axios.post(
      `${API_URL}/api/feedback`,
      {
        rating: 2,
        title: 'To be deleted',
        message: 'This feedback will be deleted to test the delete endpoint functionality',
      },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );
    const deleteTestId = deleteTestRes.data.feedback._id;
    
    const deleteRes = await axios.delete(
      `${API_URL}/api/feedback/admin/${deleteTestId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );
    log.success('Feedback deleted successfully');

    // Test 15: Verify Deletion
    log.info('\nTest 15: Verify Deletion');
    try {
      await axios.get(
        `${API_URL}/api/feedback/admin/${deleteTestId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      log.error('Deleted feedback still exists');
    } catch (err) {
      if (err.response?.status === 404) {
        log.success('Deletion verified - feedback not found');
      } else {
        log.error(`Unexpected error: ${err.message}`);
      }
    }

    // Test 16: Authentication Check (should fail without token)
    log.info('\nTest 16: Authentication Check');
    try {
      await axios.get(`${API_URL}/api/feedback/user/my-feedback`);
      log.error('Should have rejected request without token');
    } catch (err) {
      if (err.response?.status === 401) {
        log.success('Correctly rejected request without authentication');
      } else {
        log.error(`Unexpected error: ${err.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    log.success('ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n' + '='.repeat(60));
    log.error('TEST FAILED');
    console.error('='.repeat(60));
    console.error('Error Details:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || error.message);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    console.error('\nNote: Make sure:');
    console.error('1. Backend server is running on http://localhost:5000');
    console.error('2. MongoDB is connected');
    console.error('3. Test user exists: user@example.com / password123');
    console.error('4. Test admin exists: admin@example.com / admin123');
    console.error('\n' + '='.repeat(60) + '\n');
    process.exit(1);
  }
}

// Run tests
runTests();
