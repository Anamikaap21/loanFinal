import WebsiteContent from '../models/WebsiteContent.js';

export const getWebsiteContent = async (req, res, next) => {
  try {
    const contents = await WebsiteContent.find({ isActive: true });
    // Transform into key-value map for convenient frontend consumption
    const contentMap = {};
    contents.forEach((item) => {
      contentMap[item.sectionKey] = {
        title: item.title,
        subtitle: item.subtitle,
        content: item.content,
      };
    });

    return res.status(200).json({
      status: 'success',
      data: contentMap,
    });
  } catch (error) {
    next(error);
  }
};

export const getSectionContent = async (req, res, next) => {
  try {
    const { sectionKey } = req.params;
    const section = await WebsiteContent.findOne({ sectionKey, isActive: true });
    if (!section) {
      return res.status(404).json({
        status: 'error',
        message: `Website content section '${sectionKey}' not found.`,
      });
    }

    return res.status(200).json({
      status: 'success',
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getWebsiteContent,
  getSectionContent,
};
