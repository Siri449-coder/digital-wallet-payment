const express = require('express');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { protect } = require('../middleware');
const User = require('../user');
const Booking = require('../booking');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with an actual secure key

// User registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'User registration failed', details: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      res.json({ token, message: 'Login successful' });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

// Fetch balance
router.get('/balance', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json({ balance: user.balance });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance', details: error.message });
  }
});

// UPI QR Code generation
router.get('/upi-qrcode', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      const upiId = `${user.email}@wallet`;
      const qrCodeData = `upi://pay?pa=${upiId}&pn=${user.name}&cu=INR`;
      const qrCodeImage = await QRCode.toDataURL(qrCodeData);
      res.json({ qrCode: qrCodeImage });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code', details: error.message });
  }
});

// Train ticket booking
router.post('/book-ticket', protect, async (req, res) => {
  const { trainName, ticketCount, costPerTicket } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const totalCost = ticketCount * costPerTicket;
    if (user.balance < totalCost) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const booking = new Booking({
      user: user._id,
      trainName,
      ticketCount,
      totalCost,
    });

    user.balance -= totalCost;
    await user.save();
    await booking.save();

    res.json({ message: 'Ticket booked successfully', booking });
  } catch (error) {
    res.status(500).json({ error: 'Ticket booking failed', details: error.message });
  }
});

module.exports = router;
