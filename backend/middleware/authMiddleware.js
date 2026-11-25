import jwt from 'jsonwebtoken';
import { ENV } from '../config/environment.js';
import User from '../models/User.js';
import Partner from '../models/Partner.js';

export const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check HTTP-only cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const userId = decoded?.userId || decoded?.id;
    if (!decoded || !userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or malformed authentication token.',
      });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User account associated with this token no longer exists.',
      });
    }

    // Check account status
    if (user.status !== 'active') {
      // Allow partners in RESUBMISSION_REQUIRED state access for restricted document re-upload
      if (user.role === 'partner') {
        const partner = await Partner.findOne({ user: user._id });
        const regStatus = (partner?.registrationStatus || '').toUpperCase();
        if (regStatus === 'RESUBMISSION_REQUIRED' || regStatus === 'REUPLOAD_REQUIRED') {
          req.user = user;
          req.partner = partner;
          return next();
        }
      }
      return res.status(403).json({
        status: 'error',
        message: `Account is ${user.status}. Please contact RealCred support.`,
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED',
        message: 'Authentication session expired. Please log in again.',
      });
    }
    return res.status(401).json({
      status: 'error',
      message: 'Invalid authentication token: ' + error.message,
    });
  }
};
