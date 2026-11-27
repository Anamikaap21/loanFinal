import mongoose from 'mongoose';
import Bank from '../models/Bank.js';

export const getActiveBanks = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {
      status: { $in: ['active', 'ACTIVE'] },
      isDeleted: { $ne: true },
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bankCode: { $regex: q, $options: 'i' } },
      ];
    }

    const banks = await Bank.find(filter).sort({ name: 1 });

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
    const { category, search } = req.query;
    const filter = {
      status: { $in: ['active', 'ACTIVE'] },
      isDeleted: { $ne: true },
    };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { bankCode: { $regex: q, $options: 'i' } },
      ];
    }

    const banks = await Bank.find(filter).sort({ name: 1 });

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
