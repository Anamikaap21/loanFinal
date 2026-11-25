import mongoose from 'mongoose';
import Bank from '../models/Bank.js';

export const getActiveBanks = async (req, res, next) => {
  try {
    const banks = await Bank.find({
      status: { $in: ['active', 'ACTIVE'] },
      isDeleted: { $ne: true },
    }).sort({ name: 1 });

    return res.status(200).json({
      status: 'success',
      count: banks.length,
      data: banks,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBanks = async (req, res, next) => {
  try {
    // Public endpoint: only return active, non-deleted banks
    const banks = await Bank.find({
      status: { $in: ['active', 'ACTIVE'] },
      isDeleted: { $ne: true },
    }).sort({ name: 1 });

    return res.status(200).json({
      status: 'success',
      count: banks.length,
      data: banks,
    });
  } catch (error) {
    next(error);
  }
};

export const getBankById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid bank ID format.',
      });
    }

    const bank = await Bank.findOne({
      _id: id,
      status: { $in: ['active', 'ACTIVE'] },
      isDeleted: { $ne: true },
    });

    if (!bank) {
      return res.status(404).json({
        status: 'error',
        message: 'Bank not found or currently inactive.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: bank,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getActiveBanks,
  getAllBanks,
  getBankById,
};
