const jwt = require('jsonwebtoken');
const { detectIntent, PROTECTED_INTENTS, processMessage } = require('./chatbotService');
const User = require('../models/User');

const resolveUser = async (authorizationHeader) => {
  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return { userId: null, userName: '', authError: null };
  }

  const token = authorizationHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || null;

    if (!userId) {
      return { userId: null, userName: '', authError: 'Invalid token.' };
    }

    const user = await User.findById(userId).select('name').lean();
    if (!user) {
      return { userId: null, userName: '', authError: 'Please log in.' };
    }

    return { userId, userName: user.name || '', authError: null };
  } catch (error) {
    return { userId: null, userName: '', authError: 'Invalid token.' };
  }
};

const sendMessage = async (req, res) => {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message must be 500 characters or fewer',
      });
    }

    const { userId, userName, authError } = await resolveUser(req.headers.authorization);
    const intent = detectIntent(message.toLowerCase());

    if (PROTECTED_INTENTS.has(intent) && !userId) {
      return res.status(401).json({
        success: false,
        message: authError || 'Please log in.',
      });
    }

    const response = await processMessage({ message, userId, userName });

    return res.json({
      success: true,
      reply: response.reply,
      suggestions: response.suggestions || [],
      options: response.options || [],
      data: response.data || null,
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process chatbot message right now',
    });
  }
};

module.exports = {
  sendMessage,
};