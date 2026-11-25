import CallbackRequest from '../models/CallbackRequest.js';

export const createCallbackRequest = async (req, res, next) => {
  try {
    const {
      customerName,
      mobileNumber,
      email = '',
      loanType = 'General Loan Inquiry',
      preferredContactTime = 'Anytime',
      message = '',
    } = req.body;

    if (!customerName || !mobileNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide both your Name and Mobile Number.',
      });
    }

    const requestNumber = `RCCB-${Date.now().toString().slice(-6)}`;

    const callback = new CallbackRequest({
      requestNumber,
      customerName: customerName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email.trim().toLowerCase(),
      loanType: loanType.trim(),
      preferredContactTime: preferredContactTime.trim(),
      message: message.trim(),
      status: 'pending',
    });

    await callback.save();

    return res.status(201).json({
      status: 'success',
      message: 'Callback request registered successfully! Our advisory desk will contact you at your preferred time.',
      data: {
        requestNumber: callback.requestNumber,
        customerName: callback.customerName,
        preferredContactTime: callback.preferredContactTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCallbackRequests = async (req, res, next) => {
  try {
    const callbacks = await CallbackRequest.find()
      .populate('assignedTo', 'name email employeeId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: callbacks.length,
      data: callbacks,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createCallbackRequest,
  getCallbackRequests,
};
