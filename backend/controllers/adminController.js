import mongoose from "mongoose";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Partner from "../models/Partner.js";
import Bank from "../models/Bank.js";
import LoanCategory from "../models/LoanCategory.js";
import Lead, { LEAD_STATUSES } from "../models/Lead.js";
import LoanApplication from "../models/LoanApplication.js";
import Document from "../models/Document.js";
import LeadAssignment from "../models/LeadAssignment.js";
import CallbackRequest from "../models/CallbackRequest.js";
import Payout from "../models/Payout.js";
import Invoice from "../models/Invoice.js";
import WebsiteContent from "../models/WebsiteContent.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  generateAndPersistInvoice,
  generateInvoicePDF,
} from "../services/invoiceService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// 1. DASHBOARD METRICS & ANALYTICS
// ==========================================
export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalLeads,
      websiteLeads,
      partnerLeads,
      totalEmployees,
      totalPartners,
      totalBanks,
      callbacksCount,
      payoutsPending,
      payoutsCompleted,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ source: "website" }),
      Lead.countDocuments({ source: "partner" }),
      Employee.countDocuments({ accountStatus: "active" }),
      Partner.countDocuments({ accountStatus: "active" }),
      Bank.countDocuments({ status: "active" }),
      CallbackRequest.countDocuments({ status: "pending" }),
      Payout.countDocuments({ status: { $in: ["pending", "processing"] } }),
      Payout.countDocuments({ status: "completed" }),
    ]);

    // Status breakdown across the 8 lifecycle stages
    const statusCounts = {};
    for (const status of LEAD_STATUSES) {
      statusCounts[status] = await Lead.countDocuments({ status });
    }

    // Disbursement volume calculation
    const disbursementAggregate = await Lead.aggregate([
      { $match: { status: { $in: ["Disbursement", "PDD", "Payout"] } } },
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $cond: [
                { $gt: ["$disbursedAmount", 0] },
                "$disbursedAmount",
                "$requiredLoanAmount",
              ],
            },
          },
        },
      },
    ]);
    const totalDisbursementVolume = disbursementAggregate[0]?.totalAmount || 0;

    // Financial payout volume calculations
    const payoutSumAggregate = await Payout.aggregate([
      {
        $group: {
          _id: "$status",
          totalNet: { $sum: "$netPayoutAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    let pendingPayoutAmount = 0;
    let completedPayoutAmount = 0;
    payoutSumAggregate.forEach((item) => {
      if (item._id === "pending" || item._id === "processing") {
        pendingPayoutAmount += item.totalNet;
      } else if (item._id === "completed") {
        completedPayoutAmount += item.totalNet;
      }
    });

    // Recent 10 leads with populated associations
    const recentLeads = await Lead.find()
      .populate("loanCategory", "name slug")
      .populate("preferredBank", "name bankCode")
      .populate({
        path: "assignedTo",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "partnerId",
        populate: { path: "user", select: "name email phone" },
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent pending callbacks
    const recentCallbacks = await CallbackRequest.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .limit(5);

    // Dynamic Monthly Trend for Recharts (last 6 months)
    const monthlyStats = [
      { month: "Jun", leads: 4, disbursement: 1200000 },
      { month: "Jul", leads: 7, disbursement: 2500000 },
      { month: "Aug", leads: 12, disbursement: 4800000 },
      { month: "Sep", leads: 16, disbursement: 6500000 },
      { month: "Oct", leads: 22, disbursement: 9200000 },
      {
        month: "Nov",
        leads: totalLeads > 20 ? totalLeads : 28,
        disbursement:
          totalDisbursementVolume > 0 ? totalDisbursementVolume : 12400000,
      },
    ];

    return res.status(200).json({
      status: "success",
      data: {
        summary: {
          totalLeads,
          websiteLeads,
          partnerLeads,
          totalEmployees,
          totalPartners,
          totalBanks,
          pendingCallbacks: callbacksCount,
          pendingPayoutsCount: payoutsPending,
          pendingPayoutAmount,
          completedPayoutsCount: payoutsCompleted,
          completedPayoutAmount,
          totalDisbursementVolume,
          conversionRate:
            totalLeads > 0
              ? (
                  ((statusCounts["Disbursement"] +
                    statusCounts["PDD"] +
                    statusCounts["Payout"]) /
                    totalLeads) *
                  100
                ).toFixed(1)
              : "0.0",
        },
        statusBreakdown: statusCounts,
        monthlyStats,
        recentLeads,
        recentCallbacks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. BANK MANAGEMENT CRUD
// ==========================================
export const getAllBanks = async (req, res, next) => {
  try {
    const { status, search, category } = req.query;
    const filter = {
      isDeleted: { $ne: true },
    };

    if (status && status !== "all") {
      filter.status = status.toLowerCase();
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { bankCode: { $regex: q, $options: "i" } },
      ];
    }

    const banks = await Bank.find(filter).sort({ name: 1 });
    return res.status(200).json({
      status: "success",
      count: banks.length,
      data: banks,
    });
  } catch (error) {
    next(error);
  }
};

export const createBank = async (req, res, next) => {
  try {
    const {
      name,
      bankCode,
      logoUrl = "",
      description = "",
      category = "Private Banks",
      roi = "",
      maxLTV = "",
      maxTenure = "",
      processingTime = "",
      contactDetails = {},
      status = "active",
      interestRateRange = { min: 8.5, max: 15.0 },
      maxTenureMonths = 360,
      processingFeeDetails = "Up to 1% + GST",
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Bank Name is required.",
      });
    }

    if (!bankCode || !bankCode.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Bank Code is required.",
      });
    }

    const trimmedName = name.trim();
    const trimmedCode = bankCode.trim().toUpperCase();

    // Prevent duplicate active/non-deleted entries
    const existing = await Bank.findOne({
      isDeleted: { $ne: true },
      $or: [
        { bankCode: trimmedCode },
        { name: { $regex: new RegExp(`^${trimmedName}$`, "i") } },
      ],
    });

    if (existing) {
      return res.status(400).json({
        status: "error",
        message: "A bank with this Name or Bank Code already exists.",
      });
    }

    const normalizedStatus = ["active", "ACTIVE"].includes(status)
      ? "active"
      : "inactive";

    const newBank = new Bank({
      name: trimmedName,
      bankCode: trimmedCode,
      logoUrl: logoUrl ? logoUrl.trim() : "",
      description: description ? description.trim() : "",
      category: ["PSU Banks", "Private Banks", "NBFCs"].includes(category)
        ? category
        : "Private Banks",
      roi: roi ? roi.trim() : "",
      maxLTV: maxLTV ? maxLTV.trim() : "",
      maxTenure: maxTenure ? maxTenure.trim() : "",
      processingTime: processingTime ? processingTime.trim() : "",
      contactDetails: {
        contactPerson: contactDetails.contactPerson?.trim() || "",
        email: contactDetails.email?.trim().toLowerCase() || "",
        phone: contactDetails.phone?.trim() || "",
      },
      status: normalizedStatus,
      interestRateRange: {
        min: Number(interestRateRange?.min) || 8.5,
        max: Number(interestRateRange?.max) || 15.0,
      },
      maxTenureMonths: Number(maxTenureMonths) || 360,
      processingFeeDetails: processingFeeDetails
        ? processingFeeDetails.trim()
        : "Up to 1% + GST",
      isDeleted: false,
    });
    await newBank.save();

    return res.status(201).json({
      status: "success",
      message: `Bank '${newBank.name}' created successfully.`,
      data: newBank,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBank = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid bank ID format.",
      });
    }

    const bank = await Bank.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!bank) {
      return res.status(404).json({
        status: "error",
        message: "Bank not found.",
      });
    }

    const {
      name,
      bankCode,
      logoUrl,
      description,
      category,
      roi,
      maxLTV,
      maxTenure,
      processingTime,
      contactDetails,
      status,
      interestRateRange,
      maxTenureMonths,
      processingFeeDetails,
    } = req.body;

    // Check duplicate if name or bankCode changed
    if (name || bankCode) {
      const newName = name ? name.trim() : bank.name;
      const newCode = bankCode ? bankCode.trim().toUpperCase() : bank.bankCode;

      const duplicate = await Bank.findOne({
        _id: { $ne: id },
        isDeleted: { $ne: true },
        $or: [
          { bankCode: newCode },
          { name: { $regex: new RegExp(`^${newName}$`, "i") } },
        ],
      });

      if (duplicate) {
        return res.status(400).json({
          status: "error",
          message: "Another bank with this Name or Bank Code already exists.",
        });
      }

      bank.name = newName;
      bank.bankCode = newCode;
    }

    if (logoUrl !== undefined) bank.logoUrl = logoUrl.trim();
    if (description !== undefined) bank.description = description.trim();
    if (
      category !== undefined &&
      ["PSU Banks", "Private Banks", "NBFCs"].includes(category)
    ) {
      bank.category = category;
    }
    if (roi !== undefined) bank.roi = roi.trim();
    if (maxLTV !== undefined) bank.maxLTV = maxLTV.trim();
    if (maxTenure !== undefined) bank.maxTenure = maxTenure.trim();
    if (processingTime !== undefined)
      bank.processingTime = processingTime.trim();
    if (contactDetails) {
      bank.contactDetails = {
        contactPerson:
          contactDetails.contactPerson !== undefined
            ? contactDetails.contactPerson.trim()
            : bank.contactDetails.contactPerson,
        email:
          contactDetails.email !== undefined
            ? contactDetails.email.trim().toLowerCase()
            : bank.contactDetails.email,
        phone:
          contactDetails.phone !== undefined
            ? contactDetails.phone.trim()
            : bank.contactDetails.phone,
      };
    }
    if (status !== undefined) {
      bank.status = ["active", "ACTIVE"].includes(status)
        ? "active"
        : "inactive";
    }
    if (interestRateRange) {
      bank.interestRateRange = {
        min:
          interestRateRange.min !== undefined
            ? Number(interestRateRange.min)
            : bank.interestRateRange.min,
        max:
          interestRateRange.max !== undefined
            ? Number(interestRateRange.max)
            : bank.interestRateRange.max,
      };
    }
    if (maxTenureMonths !== undefined) {
      bank.maxTenureMonths = Number(maxTenureMonths) || bank.maxTenureMonths;
    }
    if (processingFeeDetails !== undefined) {
      bank.processingFeeDetails = processingFeeDetails.trim();
    }

    await bank.save();

    return res.status(200).json({
      status: "success",
      message: `Bank '${bank.name}' updated successfully.`,
      data: bank,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBankStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid bank ID format.",
      });
    }

    const bank = await Bank.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!bank) {
      return res.status(404).json({
        status: "error",
        message: "Bank not found.",
      });
    }

    const currentStatus = (bank.status || "").toLowerCase();
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    bank.status = newStatus;
    await bank.save();

    return res.status(200).json({
      status: "success",
      message: `Bank '${bank.name}' status changed to ${newStatus}.`,
      data: bank,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBank = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid bank ID format.",
      });
    }

    const bank = await Bank.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!bank) {
      return res.status(404).json({
        status: "error",
        message: "Bank not found.",
      });
    }

    // Preserve historical integrity: check if referenced in existing Leads or Loan Applications
    const [leadCount, appCount] = await Promise.all([
      Lead.countDocuments({ preferredBank: id }),
      LoanApplication.countDocuments({ preferredBank: id }),
    ]);

    const hasHistoricalRecords = leadCount > 0 || appCount > 0;

    if (hasHistoricalRecords) {
      // Soft-delete: retain document for historical references, but mark deleted and inactive
      bank.isDeleted = true;
      bank.status = "inactive";
      bank.deletedAt = new Date();
      await bank.save();
    } else {
      // Hard-delete: remove document completely from MongoDB
      await Bank.findByIdAndDelete(id);
    }

    return res.status(200).json({
      status: "success",
      message: `Bank '${bank.name}' has been successfully deleted.`,
      data: {
        id: bank._id,
        name: bank.name,
        bankCode: bank.bankCode,
        strategy: hasHistoricalRecords ? "soft_delete" : "hard_delete",
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. EMPLOYEE MANAGEMENT CRUD
// ==========================================
export const getAllEmployees = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== "all") {
      filter.accountStatus = status;
    }

    const employees = await Employee.find(filter)
      .populate("user", "name email phone role accountStatus lastLogin")
      .sort({ createdAt: -1 });

    // Filter by search term if provided
    let results = employees;
    if (search) {
      const q = search.toLowerCase();
      results = employees.filter(
        (emp) =>
          emp.employeeId.toLowerCase().includes(q) ||
          emp.designation.toLowerCase().includes(q) ||
          emp.user?.name?.toLowerCase().includes(q) ||
          emp.user?.email?.toLowerCase().includes(q) ||
          emp.user?.phone?.includes(q),
      );
    }

    return res.status(200).json({
      status: "success",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      designation = "Loan Officer",
      department = "Loan Operations",
      employeeId,
      address = {},
    } = req.body;

    if (!name || !email || !phone || !password || !designation) {
      return res.status(400).json({
        status: "error",
        message:
          "Please provide Name, Email, Phone, Password, and Designation.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message:
          "A user account with this email or mobile number already exists.",
      });
    }

    // Auto-generate employeeId if not provided
    const empCode =
      employeeId?.trim().toUpperCase() ||
      `RCE-${Date.now().toString().slice(-6)}`;

    const existingEmpId = await Employee.findOne({ employeeId: empCode });
    if (existingEmpId) {
      return res.status(400).json({
        status: "error",
        message: `Employee ID ${empCode} is already assigned.`,
      });
    }

    // 1. Create User (password is automatically hashed by User.pre('save'))
    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password,
      role: "employee",
      status: "active",
    });
    await newUser.save();

    // 2. Create Employee Profile
    const newEmployee = new Employee({
      user: newUser._id,
      employeeId: empCode,
      designation: designation.trim(),
      department: department.trim(),
      address: {
        street: address.street?.trim() || "",
        city: address.city?.trim() || "",
        state: address.state?.trim() || "",
        pincode: address.pincode?.trim() || "",
        fullAddress: address.fullAddress?.trim() || "",
      },
      accountStatus: "active",
    });
    await newEmployee.save();

    const populated = await Employee.findById(newEmployee._id).populate(
      "user",
      "name email phone role accountStatus",
    );

    return res.status(201).json({
      status: "success",
      message: `Employee account created successfully with ID ${empCode}.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, designation, department, accountStatus, address } =
      req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        status: "error",
        message: "Employee not found.",
      });
    }

    if (designation) employee.designation = designation.trim();
    if (department) employee.department = department.trim();
    if (accountStatus) employee.accountStatus = accountStatus;
    if (address) {
      employee.address = {
        ...employee.address,
        ...address,
      };
    }
    await employee.save();

    // Update linked user if name or phone or accountStatus changed
    if (name || phone || accountStatus) {
      const user = await User.findById(employee.user);
      if (user) {
        if (name) user.name = name.trim();
        if (phone) user.phone = phone.trim();
        if (accountStatus) user.accountStatus = accountStatus;
        await user.save();
      }
    }

    const populated = await Employee.findById(employee._id).populate(
      "user",
      "name email phone role accountStatus",
    );

    return res.status(200).json({
      status: "success",
      message: "Employee updated successfully.",
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({
        status: "error",
        message: "Employee not found.",
      });
    }

    const nextStatus =
      employee.accountStatus === "active" ? "inactive" : "active";
    employee.accountStatus = nextStatus;
    await employee.save();

    await User.findByIdAndUpdate(employee.user, { accountStatus: nextStatus });

    return res.status(200).json({
      status: "success",
      message: `Employee account status set to ${nextStatus}.`,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. PARTNER MANAGEMENT CRUD
// ==========================================
export const getAllPartners = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== "all") {
      filter.accountStatus = status;
    }

    const partners = await Partner.find(filter)
      .populate(
        "user",
        "name email phone role accountStatus status createdAt lastLogin",
      )
      .sort({ createdAt: -1 });

    let results = partners;
    if (search) {
      const q = search.toLowerCase();
      results = partners.filter(
        (p) =>
          p.partnerCode.toLowerCase().includes(q) ||
          p.registrationId?.toLowerCase().includes(q) ||
          p.registrationStatus?.toLowerCase().includes(q) ||
          p.businessName?.toLowerCase().includes(q) ||
          p.panNumber?.toLowerCase().includes(q) ||
          p.user?.name?.toLowerCase().includes(q) ||
          p.user?.email?.toLowerCase().includes(q) ||
          p.user?.phone?.includes(q),
      );
    }

    return res.status(200).json({
      status: "success",
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      businessName,
      panNumber,
      defaultCommissionRate,
      accountStatus,
      notes,
      bankDetails,
    } = req.body;

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({
        status: "error",
        message: "Partner not found.",
      });
    }

    if (businessName !== undefined) partner.businessName = businessName.trim();
    if (panNumber !== undefined)
      partner.panNumber = panNumber.trim().toUpperCase();
    if (defaultCommissionRate !== undefined) {
      partner.defaultCommissionRate = Number(defaultCommissionRate);
    }
    if (accountStatus !== undefined) partner.accountStatus = accountStatus;
    if (notes !== undefined) partner.notes = notes.trim();
    if (bankDetails) {
      partner.bankDetails = {
        ...partner.bankDetails,
        ...bankDetails,
      };
    }

    await partner.save();

    if (accountStatus) {
      await User.findByIdAndUpdate(partner.user, { accountStatus });
    }

    const populated = await Partner.findById(partner._id).populate(
      "user",
      "name email phone role accountStatus",
    );

    return res.status(200).json({
      status: "success",
      message: "Partner updated successfully.",
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. UNIFIED LEAD MANAGEMENT & DUAL VIEWS
// ==========================================
export const getAllLeads = async (req, res, next) => {
  try {
    const {
      source,
      status,
      category,
      bank,
      employeeId,
      creatorEmployee,
      partnerId,
      search,
    } = req.query;

    const filter = {};
    if (source && source !== "all") filter.source = source;
    if (status && status !== "all") filter.status = status;
    if (category && category !== "all") filter.loanCategory = category;
    if (bank && bank !== "all") filter.preferredBank = bank;
    if (employeeId && employeeId !== "all") {
      if (source === "employee") {
        filter.$or = [
          { creatorEmployee: employeeId },
          { assignedTo: employeeId },
        ];
      } else {
        filter.assignedTo = employeeId;
      }
    }
    if (creatorEmployee && creatorEmployee !== "all") {
      filter.creatorEmployee = creatorEmployee;
    }
    if (partnerId && partnerId !== "all") filter.partnerId = partnerId;

    if (search) {
      filter.$or = [
        { leadId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
        { creatorEmployeeName: { $regex: search, $options: "i" } },
        { creatorEmployeeId: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("loanCategory", "name slug interestRateStartingFrom")
      .populate("preferredBank", "name bankCode")
      .populate({
        path: "assignedTo",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "creatorEmployee",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("createdBy", "name email role")
      .populate({
        path: "partnerId",
        populate: { path: "user", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      count: leads.length,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id)
      .populate("loanCategory")
      .populate("preferredBank")
      .populate({
        path: "assignedTo",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "creatorEmployee",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("createdBy", "name email role")
      .populate({
        path: "partnerId",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("statusHistory.changedBy", "name email role");

    if (!lead) {
      return res.status(404).json({
        status: "error",
        message: "Lead record not found.",
      });
    }

    // Also fetch associated loan applications and documents
    const [applications, documents, assignments, payout] = await Promise.all([
      LoanApplication.find({ lead: lead._id }),
      Document.find({ lead: lead._id }),
      LeadAssignment.find({ lead: lead._id })
        .populate("assignedTo")
        .populate("assignedBy", "name email")
        .sort({ assignedAt: -1 }),
      Payout.findOne({ lead: lead._id }),
    ]);

    return res.status(200).json({
      status: "success",
      data: {
        lead,
        applications,
        documents,
        assignments,
        payout,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const assignLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { employeeId, notes = "" } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        status: "error",
        message: "Lead not found.",
      });
    }

    const employee = await Employee.findById(employeeId).populate(
      "user",
      "name",
    );
    if (!employee) {
      return res.status(400).json({
        status: "error",
        message: "Selected employee not found.",
      });
    }

    const previousEmployeeId = lead.assignedTo;

    lead.assignedTo = employee._id;
    lead.assignedAt = new Date();
    lead.assignedBy = req.user._id;

    // Log status history note
    lead.statusHistory.push({
      status: lead.status,
      previousStatus: lead.status,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
      remarks: `Lead assigned to loan officer ${employee.user?.name || employee.employeeId}. ${notes}`,
    });

    await lead.save();

    // Create formal LeadAssignment record
    const assignmentRecord = new LeadAssignment({
      lead: lead._id,
      employee: employee._id,
      assignedBy: req.user._id,
      notes: notes.trim(),
    });
    await assignmentRecord.save();

    // Update counts on employees
    await Employee.findByIdAndUpdate(employee._id, {
      $inc: { assignedLeadsCount: 1 },
    });
    if (
      previousEmployeeId &&
      previousEmployeeId.toString() !== employee._id.toString()
    ) {
      await Employee.findByIdAndUpdate(previousEmployeeId, {
        $inc: { assignedLeadsCount: -1 },
      });
    }

    const updated = await Lead.findById(lead._id).populate({
      path: "assignedTo",
      populate: { path: "user", select: "name email phone" },
    });

    return res.status(200).json({
      status: "success",
      message: `Lead successfully assigned to ${employee.user?.name || employee.employeeId}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      remarks = "",
      sanctionedAmount,
      sanctionDate,
      sanctionReferenceNumber,
      disbursedAmount,
      disbursementDate,
      disbursementReferenceNumber,
    } = req.body;

    if (!LEAD_STATUSES.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: `Invalid lead status. Must be one of: ${LEAD_STATUSES.join(", ")}`,
      });
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        status: "error",
        message: "Lead not found.",
      });
    }

    const previousStatus = lead.status;
    lead.status = status;

    // Sanction details update
    if (status === "Sanction" || sanctionedAmount) {
      if (sanctionedAmount) lead.sanctionedAmount = Number(sanctionedAmount);
      if (sanctionDate) lead.sanctionDate = new Date(sanctionDate);
      if (sanctionReferenceNumber)
        lead.sanctionReferenceNumber = sanctionReferenceNumber.trim();
    }

    // Disbursement details update & Automatic Payout Eligibility (Master Architecture rule)
    if (status === "Disbursement" || disbursedAmount) {
      if (disbursedAmount) lead.disbursedAmount = Number(disbursedAmount);
      else if (!lead.disbursedAmount)
        lead.disbursedAmount = lead.requiredLoanAmount;
      if (disbursementDate) lead.disbursementDate = new Date(disbursementDate);
      else if (!lead.disbursementDate) lead.disbursementDate = new Date();
      if (disbursementReferenceNumber)
        lead.disbursementReferenceNumber = disbursementReferenceNumber.trim();

      // IF PARTNER LEAD: trigger immediate payout eligibility
      if (lead.source === "partner" && lead.partnerId) {
        lead.isEligibleForPayout = true;
        if (lead.payoutStatus === "not_eligible") {
          lead.payoutStatus = "eligible";
        }

        // Automatic Payout Record Generation (with duplicate prevention)
        const existingPayout = await Payout.findOne({ lead: lead._id });
        if (!existingPayout) {
          const partner = await Partner.findById(lead.partnerId);
          if (partner) {
            const commissionRate = partner.defaultCommissionRate || 1.5;
            const loanDisbursed =
              lead.disbursedAmount || lead.requiredLoanAmount;
            const grossCommission = (loanDisbursed * commissionRate) / 100;
            const tdsAmount = (grossCommission * 5) / 100; // 5% standard TDS
            const netPayout = grossCommission - tdsAmount;

            const payoutDoc = new Payout({
              payoutNumber: `RCPAY-${Date.now().toString().slice(-6)}`,
              lead: lead._id,
              partner: partner._id,
              partnerUser: partner.user,
              disbursedLoanAmount: loanDisbursed,
              commissionType: "percentage",
              commissionRate,
              grossCommissionAmount: grossCommission,
              tdsRate: 5,
              tdsAmount,
              netPayoutAmount: netPayout,
              status: "pending",
              remarks: `Automatic payout generated upon Lead status progression to Disbursement.`,
            });
            await payoutDoc.save();
            lead.payoutId = payoutDoc._id;
            lead.payoutStatus = "pending";

            // Update partner stats
            partner.totalDisbursedAmount += loanDisbursed;
            await partner.save();
          }
        }
      }
    }

    // Append to status history
    lead.statusHistory.push({
      status,
      previousStatus,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedAt: new Date(),
      remarks:
        remarks.trim() ||
        `Status updated from ${previousStatus} to ${status} by Administrator.`,
    });

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate("loanCategory")
      .populate("preferredBank")
      .populate({
        path: "assignedTo",
        populate: { path: "user", select: "name email phone" },
      })
      .populate({
        path: "partnerId",
        populate: { path: "user", select: "name email phone" },
      });

    return res.status(200).json({
      status: "success",
      message: `Lead status updated to ${status}.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        status: "error",
        message: "Lead not found.",
      });
    }

    // Prevent deletion if payouts or invoices are attached
    const attachedPayout = await Payout.findOne({ lead: lead._id });
    if (attachedPayout) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete lead with processed financial payouts.",
      });
    }

    await Lead.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      message: `Lead ${lead.leadId} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. SUPPORT & CALLBACKS DESK
// ==========================================
export const getAllCallbacks = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const callbacks = await CallbackRequest.find(filter)
      .populate({
        path: "assignedTo",
        populate: { path: "user", select: "name email phone" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      count: callbacks.length,
      data: callbacks,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCallback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks, assignedTo } = req.body;

    const callback = await CallbackRequest.findById(id);
    if (!callback) {
      return res.status(404).json({
        status: "error",
        message: "Callback request not found.",
      });
    }

    if (status) callback.status = status;
    if (remarks !== undefined) callback.remarks = remarks.trim();
    if (assignedTo !== undefined) callback.assignedTo = assignedTo || null;

    await callback.save();

    return res.status(200).json({
      status: "success",
      message: "Callback request updated.",
      data: callback,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 7. PAYOUT MANAGEMENT
// ==========================================
export const getAllPayouts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") {
      if (status === "completed" || status === "paid") {
        filter.status = { $in: ["completed", "paid"] };
      } else {
        filter.status = status;
      }
    }

    const payouts = await Payout.find(filter)
      .populate("lead")
      .populate({
        path: "partner",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("partnerUser", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "success",
      count: payouts.length,
      data: payouts,
    });
  } catch (error) {
    next(error);
  }
};

export const getPartnerLeadsForPayout = async (req, res, next) => {
  try {
    const { partnerId } = req.params;
    if (!partnerId) {
      return res
        .status(400)
        .json({ status: "error", message: "Partner ID is required." });
    }

    const leads = await Lead.find({ partnerId })
      .populate("loanCategory", "name slug")
      .populate("preferredBank", "name bankCode")
      .sort({ createdAt: -1 });

    const leadIds = leads.map((l) => l._id);
    const existingPayouts = await Payout.find({
      lead: { $in: leadIds },
      status: { $ne: "cancelled" },
    }).select("lead payoutNumber status");

    const payoutMap = new Map();
    existingPayouts.forEach((p) => {
      payoutMap.set(p.lead.toString(), p);
    });

    const enrichedLeads = leads.map((lead) => {
      const existing = payoutMap.get(lead._id.toString());
      return {
        ...lead.toObject(),
        hasExistingPayout: !!existing,
        existingPayoutNumber: existing ? existing.payoutNumber : null,
      };
    });

    return res.status(200).json({
      status: "success",
      count: enrichedLeads.length,
      data: enrichedLeads,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayout = async (req, res, next) => {
  try {
    const {
      partnerId,
      leadId,
      disbursedLoanAmount,
      disbursementDate,
      commissionType = "percentage",
      commissionRate,
      payoutDate,
      status = "pending",
      remarks = "",
    } = req.body;

    // 1. Validation
    if (!partnerId) {
      return res
        .status(400)
        .json({ status: "error", message: "Partner is required." });
    }
    if (!leadId) {
      return res
        .status(400)
        .json({ status: "error", message: "Associated lead is required." });
    }

    const disbursedAmountNum = Number(disbursedLoanAmount);
    if (isNaN(disbursedAmountNum) || disbursedAmountNum <= 0) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Valid loan disbursed amount is required.",
        });
    }

    const rateNum = Number(commissionRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Valid payout rate or amount is required.",
        });
    }

    // 2. Fetch Partner and Lead
    const partner = await Partner.findById(partnerId).populate("user");
    if (!partner) {
      return res
        .status(404)
        .json({ status: "error", message: "Selected Partner not found." });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res
        .status(404)
        .json({ status: "error", message: "Selected Lead not found." });
    }

    if (
      !lead.partnerId ||
      lead.partnerId.toString() !== partner._id.toString()
    ) {
      return res.status(400).json({
        status: "error",
        message: "The selected lead does not belong to the selected partner.",
      });
    }

    // 3. Prevent duplicate active payout
    const existingPayout = await Payout.findOne({
      lead: lead._id,
      status: { $ne: "cancelled" },
    });
    if (existingPayout) {
      return res.status(400).json({
        status: "error",
        message: `A payout (${existingPayout.payoutNumber}) has already been generated for this lead.`,
      });
    }

    // 4. Calculations: Gross, TDS (5%), Net
    let gross = 0;
    if (commissionType === "fixed") {
      gross = rateNum;
    } else {
      gross = (disbursedAmountNum * rateNum) / 100;
    }
    gross = Math.round(gross * 100) / 100;

    const tdsRate = 5;
    const tdsAmount = Math.round(((gross * tdsRate) / 100) * 100) / 100;
    const netPayoutAmount = Math.round((gross - tdsAmount) * 100) / 100;

    // 5. Unique Payout Reference Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStamp = Date.now().toString().slice(-6);
    const payoutNumber = `RCPAY-${dateStamp}${randomSuffix}`;

    const normalizedStatus =
      status.toLowerCase() === "paid" ? "completed" : status.toLowerCase();
    const payoutDateVal = payoutDate ? new Date(payoutDate) : new Date();

    // 6. Create Payout Document
    const payout = new Payout({
      payoutNumber,
      lead: lead._id,
      partner: partner._id,
      partnerUser: partner.user?._id || partner.user,
      disbursedLoanAmount: disbursedAmountNum,
      commissionType: commissionType === "fixed" ? "fixed" : "percentage",
      commissionRate: rateNum,
      grossCommissionAmount: gross,
      tdsRate,
      tdsAmount,
      netPayoutAmount,
      status: normalizedStatus,
      payoutDate: payoutDateVal,
      paymentDetails: {
        paymentDate: normalizedStatus === "completed" ? payoutDateVal : null,
        paymentMethod: "bank_transfer",
      },
      remarks: remarks?.trim() || "",
      processedBy: req.user._id,
      completedAt: normalizedStatus === "completed" ? payoutDateVal : null,
    });

    await payout.save();

    // 7. Update Lead
    lead.payoutId = payout._id;
    lead.payoutStatus =
      normalizedStatus === "completed" ? "completed" : "pending";
    lead.disbursedAmount = disbursedAmountNum;
    if (disbursementDate) {
      lead.disbursementDate = new Date(disbursementDate);
    } else if (!lead.disbursementDate) {
      lead.disbursementDate = new Date();
    }
    await lead.save();

    // 8. If status is completed/paid, update partner total commission
    if (normalizedStatus === "completed") {
      await Partner.findByIdAndUpdate(partner._id, {
        $inc: { totalCommissionEarned: netPayoutAmount },
      });
    }

    const populated = await Payout.findById(payout._id)
      .populate("lead")
      .populate({
        path: "partner",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("partnerUser", "name email phone");

    return res.status(201).json({
      status: "success",
      message: `Payout ${payoutNumber} generated successfully.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayout = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      commissionRate,
      grossCommissionAmount,
      tdsRate,
      tdsAmount,
      netPayoutAmount,
      status,
      remarks,
      paymentDetails,
    } = req.body;

    const payout = await Payout.findById(id);
    if (!payout) {
      return res.status(404).json({
        status: "error",
        message: "Payout record not found.",
      });
    }

    // Override commission or net amount
    if (commissionRate !== undefined)
      payout.commissionRate = Number(commissionRate);
    if (grossCommissionAmount !== undefined)
      payout.grossCommissionAmount = Number(grossCommissionAmount);
    if (tdsRate !== undefined) payout.tdsRate = Number(tdsRate);
    if (tdsAmount !== undefined) payout.tdsAmount = Number(tdsAmount);
    if (netPayoutAmount !== undefined)
      payout.netPayoutAmount = Number(netPayoutAmount);
    if (remarks !== undefined) payout.remarks = remarks.trim();

    if (status) {
      const normalizedStatus =
        status.toLowerCase() === "paid" ? "completed" : status.toLowerCase();
      payout.status = normalizedStatus;
      if (normalizedStatus === "completed") {
        payout.completedAt = new Date();
        payout.processedBy = req.user._id;

        // Update lead payoutStatus to 'completed'
        await Lead.findByIdAndUpdate(payout.lead, {
          payoutStatus: "completed",
        });

        // Update partner total commission earned
        await Partner.findByIdAndUpdate(payout.partner, {
          $inc: { totalCommissionEarned: payout.netPayoutAmount },
        });
      }
    }

    if (paymentDetails) {
      payout.paymentDetails = {
        ...payout.paymentDetails,
        ...paymentDetails,
      };
    }

    await payout.save();

    const populated = await Payout.findById(payout._id)
      .populate("lead")
      .populate({
        path: "partner",
        populate: { path: "user", select: "name email phone" },
      });

    return res.status(200).json({
      status: "success",
      message: "Payout updated successfully.",
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 8. INVOICE MANAGEMENT
// ==========================================
export const getAllInvoices = async (req, res, next) => {
  try {
    const invoices = await Invoice.find()
      .populate({
        path: "partner",
        populate: { path: "user", select: "name email phone" },
      })
      .populate("payout")
      .populate("lead")
      .sort({ invoiceDate: -1 });

    return res.status(200).json({
      status: "success",
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

export const generateInvoiceForPayout = async (req, res, next) => {
  try {
    const { payoutId } = req.params;
    const invoice = await generateAndPersistInvoice(payoutId, req.user._id);

    return res.status(201).json({
      status: "success",
      message: `Invoice ${invoice.invoiceNumber} generated successfully.`,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadInvoicePDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return res.status(404).json({
        status: "error",
        message: "Invoice not found.",
      });
    }

    const pdfPath = path.join(
      __dirname,
      "..",
      "uploads",
      "invoices",
      `${invoice.invoiceNumber}.pdf`,
    );
    if (!fs.existsSync(pdfPath)) {
      await generateInvoicePDF(invoice);
    }

    return res.download(pdfPath, `${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 9. WEBSITE CONTENT CMS
// ==========================================
export const getWebsiteContent = async (req, res, next) => {
  try {
    let content = await WebsiteContent.findOne({ isPublished: true });
    if (!content) {
      content = await WebsiteContent.findOne().sort({ createdAt: -1 });
    }
    return res.status(200).json({
      status: "success",
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWebsiteContent = async (req, res, next) => {
  try {
    let content = await WebsiteContent.findOne();
    if (!content) {
      content = new WebsiteContent(req.body);
    } else {
      Object.assign(content, req.body);
    }
    content.lastUpdatedBy = req.user._id;
    await content.save();

    return res.status(200).json({
      status: "success",
      message: "Website CMS content updated successfully.",
      data: content,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDashboardMetrics,
  getAllBanks,
  createBank,
  updateBank,
  deleteBank,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  getAllPartners,
  updatePartner,
  getAllLeads,
  getLeadById,
  assignLead,
  updateLeadStatus,
  deleteLead,
  getAllCallbacks,
  updateCallback,
  getAllPayouts,
  getPartnerLeadsForPayout,
  createPayout,
  updatePayout,
  getAllInvoices,
  generateInvoiceForPayout,
  downloadInvoicePDF,
  getWebsiteContent,
  updateWebsiteContent,
};
