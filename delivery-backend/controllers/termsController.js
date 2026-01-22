import Terms from '../models/Terms.js';
import { validationResult } from 'express-validator';

// Get terms by type (public endpoint)
export const getTermsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    const terms = await Terms.getActiveTerms(type);
    
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Terms not found'
      });
    }

    res.json({
      success: true,
      data: {
        terms: terms.getFormattedContent()
      }
    });

  } catch (error) {
    console.error('Get terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms'
    });
  }
};

// Get all terms types (public endpoint)
export const getAllTermsTypes = async (req, res) => {
  try {
    const terms = await Terms.find({ isActive: true })
      .select('type title version effectiveDate')
      .sort({ type: 1 });

    res.json({
      success: true,
      data: {
        terms: terms.map(term => ({
          type: term.type,
          title: term.title,
          version: term.version,
          effectiveDate: term.effectiveDate
        }))
      }
    });

  } catch (error) {
    console.error('Get all terms types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms'
    });
  }
};

// Admin: Create new terms
export const createTerms = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, title, content, sections, version, effectiveDate } = req.body;

    // Check if terms of this type already exist
    const existingTerms = await Terms.findOne({ type, isActive: true });
    if (existingTerms) {
      // Deactivate old terms
      existingTerms.isActive = false;
      await existingTerms.save();
    }

    const terms = new Terms({
      type,
      title,
      content,
      sections: sections || [],
      version: version || '1.0',
      effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
      updatedBy: req.user.id
    });

    await terms.save();

    res.status(201).json({
      success: true,
      message: 'Terms created successfully',
      data: {
        terms: terms.getFormattedContent()
      }
    });

  } catch (error) {
    console.error('Create terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create terms'
    });
  }
};

// Admin: Update existing terms
export const updateTerms = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const terms = await Terms.findById(id);
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Terms not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'updatedBy' && updateData[key] !== undefined) {
        terms[key] = updateData[key];
      }
    });

    terms.updatedBy = req.user.id;
    await terms.save();

    res.json({
      success: true,
      message: 'Terms updated successfully',
      data: {
        terms: terms.getFormattedContent()
      }
    });

  } catch (error) {
    console.error('Update terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update terms'
    });
  }
};

// Admin: Get all terms (including inactive)
export const getAllTerms = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, isActive } = req.query;

    const query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const terms = await Terms.find(query)
      .populate('updatedBy', 'firstName lastName email')
      .sort({ effectiveDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Terms.countDocuments(query);

    res.json({
      success: true,
      data: {
        terms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTerms: total
        }
      }
    });

  } catch (error) {
    console.error('Get all terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms'
    });
  }
};

// Admin: Delete terms
export const deleteTerms = async (req, res) => {
  try {
    const { id } = req.params;

    const terms = await Terms.findById(id);
    if (!terms) {
      return res.status(404).json({
        success: false,
        message: 'Terms not found'
      });
    }

    // Soft delete by setting isActive to false
    terms.isActive = false;
    terms.updatedBy = req.user.id;
    await terms.save();

    res.json({
      success: true,
      message: 'Terms deleted successfully'
    });

  } catch (error) {
    console.error('Delete terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete terms'
    });
  }
};

// Get terms history by type
export const getTermsHistory = async (req, res) => {
  try {
    const { type } = req.params;

    const termsHistory = await Terms.find({ type })
      .populate('updatedBy', 'firstName lastName')
      .sort({ effectiveDate: -1 });

    res.json({
      success: true,
      data: {
        history: termsHistory.map(terms => ({
          id: terms._id,
          version: terms.version,
          effectiveDate: terms.effectiveDate,
          lastUpdated: terms.lastUpdated,
          isActive: terms.isActive,
          updatedBy: terms.updatedBy
        }))
      }
    });

  } catch (error) {
    console.error('Get terms history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch terms history'
    });
  }
};