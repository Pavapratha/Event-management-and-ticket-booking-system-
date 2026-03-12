// Sample Event Data with Ticket Categories
// Use this to test the complete booking flow

const sampleEventsWithCategories = [
  {
    title: "SymphonyX Music Festival 2024",
    description: "Experience the most electrifying music festival of the year featuring international and local artists performing live across multiple stages. Two days of non-stop entertainment with food, drinks, and amazing vibes.",
    category: "Music",
    date: new Date("2024-04-20T18:00:00Z"),
    time: "6:00 PM",
    location: "Mount Lavinia Beach",
    venue: "Beach Amphitheatre",
    price: 2500,
    totalSeats: 5000,
    availableSeats: 4200,
    image: "https://via.placeholder.com/800x400?text=Festival",
    pickupInstructions: "Collect your wristband at the main entrance 1 hour before event starts. Bring valid ID.",
    ticketCategories: [
      {
        name: "General Admission",
        price: 2500,
        totalQuantity: 3000,
        availableQuantity: 2800
      },
      {
        name: "VIP Box",
        price: 5000,
        totalQuantity: 500,
        availableQuantity: 450
      },
      {
        name: "Student Discount",
        price: 1500,
        totalQuantity: 1000,
        availableQuantity: 950
      },
      {
        name: "Family Package (4)",
        price: 8000,
        totalQuantity: 500,
        availableQuantity: 240
      }
    ]
  },
  {
    title: "Cricket Premier League - Final Match",
    description: "Watch the final match of the season as our national champions battle for the trophy. Live commentary, food stalls, and entertainment throughout the day. Arrive early for the opening ceremony.",
    category: "Sports",
    date: new Date("2024-05-10T14:30:00Z"),
    time: "2:30 PM",
    location: "R. Premadasa Stadium",
    venue: "Main Field",
    price: 3000,
    totalSeats: 35000,
    availableSeats: 28000,
    image: "https://via.placeholder.com/800x400?text=Cricket",
    pickupInstructions: "Tickets available at the gate. Entry opens at 1:00 PM. Please allow 30 minutes for security check.",
    ticketCategories: [
      {
        name: "Upper Tier",
        price: 2000,
        totalQuantity: 15000,
        availableQuantity: 12000
      },
      {
        name: "Middle Tier",
        price: 3500,
        totalQuantity: 12000,
        availableQuantity: 10500
      },
      {
        name: "Premium Seats",
        price: 6000,
        totalQuantity: 5000,
        availableQuantity: 4000
      },
      {
        name: "Corporate Box",
        price: 15000,
        totalQuantity: 1000,
        availableQuantity: 850
      },
      {
        name: "Family Pass (5)",
        price: 12000,
        totalQuantity: 2000,
        availableQuantity: 650
      }
    ]
  },
  {
    title: "TechTalk 2024 - Future of AI",
    description: "Join industry leaders and innovators as they discuss the latest developments in artificial intelligence, machine learning, and automation. Interactive workshops, networking sessions, and live product demos throughout the day.",
    category: "Technology",
    date: new Date("2024-03-25T09:00:00Z"),
    time: "9:00 AM",
    location: "Colombo Convention Centre",
    venue: "Main Auditorium",
    price: 3500,
    totalSeats: 2000,
    availableSeats: 1450,
    image: "https://via.placeholder.com/800x400?text=TechTalk",
    pickupInstructions: "Registration starts at 8:30 AM. Please bring your booking confirmation email. Complimentary breakfast and lunch included.",
    ticketCategories: [
      {
        name: "Standard Pass",
        price: 3500,
        totalQuantity: 1200,
        availableQuantity: 950
      },
      {
        name: "Premium Pass (VIP)",
        price: 6000,
        totalQuantity: 400,
        availableQuantity: 300
      },
      {
        name: "Workshop Bundle",
        price: 5500,
        totalQuantity: 300,
        availableQuantity: 150
      },
      {
        name: "Corporate Table (10)",
        price: 30000,
        totalQuantity: 100,
        availableQuantity: 50
      }
    ]
  },
  {
    title: "Colombo Food & Wine Festival",
    description: "Celebrate culinary excellence with tastings from Sri Lanka's finest restaurants, wine pairings from international vineyards, and live cooking demonstrations by celebrity chefs. Three days of gastronomic delight.",
    category: "Food & Drink",
    date: new Date("2024-04-05T11:00:00Z"),
    time: "11:00 AM",
    location: "Colombo Waterfront",
    venue: "Open Air Fashion Week Venue",
    price: 1500,
    totalSeats: 3000,
    availableSeats: 2200,
    image: "https://via.placeholder.com/800x400?text=Food+Festival",
    pickupInstructions: "Show QR code at entrance. Recommendations: Arrive before noon to avoid queues. Free water and parking available.",
    ticketCategories: [
      {
        name: "Single Day Pass",
        price: 1500,
        totalQuantity: 2000,
        availableQuantity: 1500
      },
      {
        name: "3-Day Pass",
        price: 3500,
        totalQuantity: 800,
        availableQuantity: 600
      },
      {
        name: "Chef's Table (Premium)",
        price: 5000,
        totalQuantity: 150,
        availableQuantity: 80
      },
      {
        name: "Couples Package",
        price: 2600,
        totalQuantity: 50,
        availableQuantity: 20
      }
    ]
  },
  {
    title: "Contemporary Art Exhibition Opening",
    description: "Explore the latest contemporary art exhibition featuring 150+ works from emerging and established artists. Wine and cheese reception, artist talks, and interactive installations. Limited edition prints available for purchase.",
    category: "Arts",
    date: new Date("2024-03-30T18:00:00Z"),
    time: "6:00 PM",
    location: "National Art Gallery",
    venue: "East Wing",
    price: 1000,
    totalSeats: 500,
    availableSeats: 380,
    image: "https://via.placeholder.com/800x400?text=Art+Exhibition",
    pickupInstructions: "Members receive 20% discount. Free exhibition catalog with every ticket. Limited to 500 guests.",
    ticketCategories: [
      {
        name: "General Entry",
        price: 1000,
        totalQuantity: 350,
        availableQuantity: 280
      },
      {
        name: "Member Discount",
        price: 800,
        totalQuantity: 100,
        availableQuantity: 80
      },
      {
        name: "Premium + Dinner",
        price: 3000,
        totalQuantity: 50,
        availableQuantity: 20
      }
    ]
  },
  {
    title: "Business Leadership Summit 2024",
    description: "Connect with C-suite executives, entrepreneurs, and business leaders. Day-long summit featuring keynote speeches, panel discussions, and networking sessions. Topics: Digital transformation, sustainability, and innovation.",
    category: "Business",
    date: new Date("2024-04-12T08:00:00Z"),
    time: "8:00 AM",
    location: "Hilton Colombo",
    venue: "Grand Ballroom",
    price: 5000,
    totalSeats: 800,
    availableSeats: 620,
    image: "https://via.placeholder.com/800x400?text=Leadership+Summit",
    pickupInstructions: "Early bird registration at 7:30 AM. Complimentary buffet breakfast and lunch. Business cards exchange center available.",
    ticketCategories: [
      {
        name: "Standard Pass",
        price: 5000,
        totalQuantity: 500,
        availableQuantity: 420
      },
      {
        name: "VIP Pass (Front Row)",
        price: 10000,
        totalQuantity: 150,
        availableQuantity: 100
      },
      {
        name: "Executive Plus",
        price: 8000,
        totalQuantity: 100,
        availableQuantity: 80
      },
      {
        name: "Delegation (20)",
        price: 75000,
        totalQuantity: 50,
        availableQuantity: 20
      }
    ]
  },
  {
    title: "STEM Workshop Series - Robotics",
    description: "Interactive hands-on workshops for students (age 10-18) learning robotics programming and automation. Expert instructors, working robots, and competition opportunity at the end. Certificate provided.",
    category: "Education",
    date: new Date("2024-04-22T09:30:00Z"),
    time: "9:30 AM",
    location: "National Institute of Technology",
    venue: "Innovation Lab",
    price: 1200,
    totalSeats: 150,
    availableSeats: 95,
    image: "https://via.placeholder.com/800x400?text=STEM+Workshop",
    pickupInstructions: "Workshop duration: 4 hours. Bring notebook and pen. Lunch and refreshments provided. Parking available.",
    ticketCategories: [
      {
        name: "Student Solo",
        price: 1200,
        totalQuantity: 100,
        availableQuantity: 60
      },
      {
        name: "Group (3 students)",
        price: 3000,
        totalQuantity: 30,
        availableQuantity: 25
      },
      {
        name: "Parent + Child",
        price: 1800,
        totalQuantity: 20,
        availableQuantity: 10
      }
    ]
  }
];

// Export for Node.js
module.exports = { sampleEventsWithCategories };

// ===== MONGODB INSERTMANY SCRIPT =====
/*
To use this data in MongoDB:

1. Copy sampleEventsWithCategories from above

2. In MongoDB shell or Compass:

db.events.insertMany([
  {
    title: "SymphonyX Music Festival 2024",
    description: "Experience the most electrifying...",
    category: "Music",
    date: new Date("2024-04-20T18:00:00Z"),
    time: "6:00 PM",
    location: "Mount Lavinia Beach",
    venue: "Beach Amphitheatre",
    price: 2500,
    totalSeats: 5000,
    availableSeats: 4200,
    image: "https://via.placeholder.com/800x400?text=Festival",
    pickupInstructions: "Collect your wristband at the main entrance 1 hour before event starts. Bring valid ID.",
    status: "active",
    ticketCategories: [
      {
        _id: ObjectId(),
        name: "General Admission",
        price: 2500,
        totalQuantity: 3000,
        availableQuantity: 2800
      },
      {
        _id: ObjectId(),
        name: "VIP Box",
        price: 5000,
        totalQuantity: 500,
        availableQuantity: 450
      },
      {
        _id: ObjectId(),
        name: "Student Discount",
        price: 1500,
        totalQuantity: 1000,
        availableQuantity: 950
      },
      {
        _id: ObjectId(),
        name: "Family Package (4)",
        price: 8000,
        totalQuantity: 500,
        availableQuantity: 240
      }
    ]
  },
  // ... add remaining events
])

3. Verify:
db.events.find().pretty()

*/

// ===== TEST BOOKING SEQUENCE =====
/*
1. LOGIN to get token:
   POST /api/auth/login
   { "email": "user@test.com", "password": "password" }
   Response: { token: "JWT_TOKEN" }

2. CREATE PENDING BOOKING:
   POST /api/bookings
   Headers: { Authorization: "Bearer JWT_TOKEN" }
   Body: {
     "eventId": "<event_id_from_above>",
     "ticketDetails": [
       { "categoryId": "<category_id>", "quantity": 2 },
       { "categoryId": "<category_id>", "quantity": 1 }
     ]
   }
   Response: {
     "success": true,
     "booking": {
       "_id": "BOOKING_ID",
       "bookingId": "BK-XXXXX",
       "status": "pending",
       ...
     }
   }

3. PROCESS PAYMENT:
   (Use fake payment gateway in UI)
   Amount: booking.totalAmount

4. CONFIRM BOOKING:
   PATCH /api/bookings/BOOKING_ID/confirm
   Headers: { Authorization: "Bearer JWT_TOKEN" }
   Body: {
     "paymentDetails": {
       "transactionId": "TXN-12345",
       "method": "fake-payment-gateway",
       "status": "completed",
       "cardLast4": "1234"
     }
   }
   Response: {
     "success": true,
     "booking": {
       "status": "confirmed",
       "qrCode": "data:image/png;base64,...",
       ...
     }
   }

5. VIEW BOOKING:
   GET /api/bookings/BOOKING_ID
   Should show confirmed booking with QR code

6. DOWNLOAD TICKET:
   Use html2canvas + jsPDF to save ticket as PNG or PDF

7. VERIFY IN DASHBOARD:
   GET /api/bookings
   Booking should appear in user's booking list
*/

// ===== PRICE VARIATIONS BY EVENT =====
/*
Music Festival:
- General: 2500 LKR
- VIP: 5000 LKR (+100%)
- Student: 1500 LKR (-40%)
- Family 4: 8000 LKR (2000 each)

Cricket:
- Upper: 2000 LKR
- Middle: 3500 LKR
- Premium: 6000 LKR
- Box: 15000 LKR
- Family 5: 12000 LKR (2400 each)

Tech:
- Standard: 3500 LKR
- Premium: 6000 LKR
- Workshop: 5500 LKR
- Corporate 10: 30000 LKR (3000 each)

Food Festival:
- Day: 1500 LKR
- 3-Day: 3500 LKR
- Chef's Table: 5000 LKR
- Couples: 2600 LKR

Art:
- General: 1000 LKR
- Member: 800 LKR
- Dinner: 3000 LKR

Business:
- Standard: 5000 LKR
- VIP: 10000 LKR
- Executive: 8000 LKR
- Delegation 20: 75000 LKR (3750 each)

Education:
- Solo: 1200 LKR
- Group 3: 3000 LKR (1000 each)
- Parent+Child: 1800 LKR
*/
