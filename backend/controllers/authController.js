import {
  loginUser,
  registerPartner as registerPartnerService,
  getCurrentUserProfile,
} from '../services/authService.js';
import User from '../models/User.js';

export const login = async (req, res, next) => {
  try {
    const { emailOrPhone, password, role, selectedRole } = req.body;
    const result = await loginUser({
      emailOrPhone,
      password,
      selectedRole: role || selectedRole,
    });

    // Set secure HTTP-only cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      status: 'success',
      message: `Welcome back, ${result.user.name}! Logged in as ${result.role}.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const registerPartner = async (req, res, next) => {
  try {
    const result = await registerPartnerService(req.body, req.files);

    return res.status(201).json({
      status: 'success',
      message:
        'Your registration has been submitted successfully. Your KYC documents are pending Admin verification. Your Partner CRM account will be activated after approval.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const result = await getCurrentUserProfile(req.user._id);
    return res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Incorrect current password.',
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  registerPartner,
  getMe,
  logout,
  changePassword,
};
