import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Verify Your Email - Delivery System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Welcome to Delivery System!</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for registering with our delivery system. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.verificationLink}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #007bff;">${data.verificationLink}</p>
        <p>This verification link will expire in 24 hours.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with us, please ignore this email.
        </p>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset - Delivery System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Hi ${data.name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetLink}" 
             style="background-color: #dc3545; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #dc3545;">${data.resetLink}</p>
        <p><strong>This reset link will expire in 10 minutes.</strong></p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
      </div>
    `
  }),

  orderConfirmation: (data) => ({
    subject: `Order Confirmation - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745; text-align: center;">Order Confirmed!</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your order has been confirmed and is being prepared by ${data.restaurantName}.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Restaurant:</strong> ${data.restaurantName}</p>
          <p><strong>Estimated Delivery:</strong> ${data.estimatedDeliveryTime}</p>
          <p><strong>Total:</strong> $${data.total}</p>
        </div>
        <p>You can track your order status using the link below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.trackingLink}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Order
          </a>
        </div>
      </div>
    `
  }),

  orderDelivered: (data) => ({
    subject: `Order Delivered - ${data.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745; text-align: center;">Order Delivered!</h2>
        <p>Hi ${data.customerName},</p>
        <p>Your order <strong>${data.orderNumber}</strong> has been successfully delivered!</p>
        <p>We hope you enjoyed your meal from ${data.restaurantName}.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reviewLink}" 
             style="background-color: #ffc107; color: #212529; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Rate Your Order
          </a>
        </div>
        <p>Thank you for choosing our delivery service!</p>
      </div>
    `
  })
};

export const sendEmail = async ({ to, subject, template, data }) => {
  try {
    const transporter = createTransporter();
    
    let emailContent;
    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else {
      emailContent = { subject, html: data.html || data.text };
    }

    const mailOptions = {
      from: `"Delivery System" <${process.env.EMAIL_FROM}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendBulkEmail = async (emails) => {
  try {
    const transporter = createTransporter();
    const results = [];

    for (const email of emails) {
      try {
        const result = await sendEmail(email);
        results.push({ success: true, messageId: result.messageId, to: email.to });
      } catch (error) {
        results.push({ success: false, error: error.message, to: email.to });
      }
    }

    return results;
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw error;
  }
};