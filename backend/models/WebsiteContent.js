import mongoose from 'mongoose';

const websiteContentSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: [true, 'Section key is required'],
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      default: '',
      trim: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const WebsiteContent = mongoose.model('WebsiteContent', websiteContentSchema);
export default WebsiteContent;
