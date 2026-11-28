import mongoose from 'mongoose';
import Bank from '../models/Bank.js';

const VERIFIED_BANK_LOGOS = {
  BOB: '/assets/banks/bob.svg',
  BOI: '/assets/banks/boi.png',
  BOM: '/assets/banks/bom.svg',
  CANARA: '/assets/banks/canara.svg',
  IDBI: '/assets/banks/idbi.svg',
  INDIANBANK: '/assets/banks/indianbank.svg',
  PNB: '/assets/banks/pnb.svg',
  SBI: '/assets/banks/sbi.svg',
  UCO: '/assets/banks/uco.jpg',
  UNIONBANK: '/assets/banks/unionbank.svg',
  AUBANK: '/assets/banks/aubank.svg',
  AXIS: '/assets/banks/axis.svg',
  DCB: '/assets/banks/dcb.svg',
  FEDERAL: '/assets/banks/federal.svg',
  HDFC: '/assets/banks/hdfc.svg',
  HSBC: '/assets/banks/hsbc.svg',
  ICICI: '/assets/banks/icici.svg',
  IDFC: '/assets/banks/idfc.svg',
  INDUSIND: '/assets/banks/indusind.svg',
  KOTAK: '/assets/banks/kotak.svg',
  ABHFL: '/assets/banks/abhfl.svg',
  AXISFIN: '/assets/banks/axisfin.webp',
  BAJAJHFL: '/assets/banks/bajajhfl.svg',
  CHOLA: '/assets/banks/chola.svg',
  EASYHOME: '/assets/banks/easyhome.svg',
  GODREJHFL: '/assets/banks/godrejhfl.svg',
  HINDUJA: '/assets/banks/hinduja.png',
  ICICIHFC: '/assets/banks/icicihfc.png',
  IIFL: '/assets/banks/iifl.svg',
  LTFIN: '/assets/banks/ltfin.svg',
  LICHFL: '/assets/banks/lichfl.svg',
  MOTILAL: '/assets/banks/motilal.svg',
  PIRAMAL: '/assets/banks/piramal.svg',
  PNBHFL: '/assets/banks/pnbhfl.png',
  SAMMAN: '/assets/banks/samman.png',
  TATAHFC: '/assets/banks/tatahfc.svg',
  VASTU: '/assets/banks/vastu.svg',
};

const mapBankWithVerifiedLogo = (bankDoc) => {
  const bank = bankDoc.toObject ? bankDoc.toObject() : { ...bankDoc };
  const code = (bank.bankCode || '').toUpperCase().trim();
  bank.logoUrl = VERIFIED_BANK_LOGOS[code] || bank.logoUrl || '';
  return bank;
};

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
      data: banks.map(mapBankWithVerifiedLogo),
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
      data: banks.map(mapBankWithVerifiedLogo),
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
      data: mapBankWithVerifiedLogo(bank),
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
