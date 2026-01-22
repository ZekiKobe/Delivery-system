import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  CheckCircle,
  AlertCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import { Button, Card, Input } from '../../components/ui';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support team',
      value: '+251 11 123 4567',
      available: '24/7 Support Available',
      action: 'Call Now',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us an email and we\'ll respond within 24 hours',
      value: 'support@fastdrop.com',
      available: 'Response within 24 hours',
      action: 'Send Email',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      value: 'Available on website',
      available: 'Mon-Sun: 8:00 AM - 10:00 PM',
      action: 'Start Chat',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: MapPin,
      title: 'Visit Our Office',
      description: 'Come visit us at our headquarters',
      value: '123 Tech Street, Addis Ababa',
      available: 'Mon-Fri: 9:00 AM - 6:00 PM',
      action: 'Get Directions',
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Technical Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'complaint', label: 'Complaint' },
    { value: 'other', label: 'Other' }
  ];

  const faqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order in real-time through our app or website. Go to "My Orders" section and click on your current order to see live tracking.'
    },
    {
      question: 'What are your delivery hours?',
      answer: 'We deliver 24/7 in most areas. However, restaurant availability may vary. You can check specific restaurant hours when browsing.'
    },
    {
      question: 'How do I cancel my order?',
      answer: 'You can cancel your order within 5 minutes of placing it. Go to "My Orders" and click "Cancel Order". After this window, please contact support.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer full refunds for cancelled orders and partial refunds for issues with food quality or missing items. Contact our support team for assistance.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help! Get in touch with our support team for any questions, 
              feedback, or assistance you need with your delivery experience.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <Card.Content className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-full ${method.color} flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                      <p className="font-medium text-gray-900 mb-2">{method.value}</p>
                      <p className="text-xs text-gray-500 mb-4">{method.available}</p>
                      <Button variant="outline" size="sm" className="w-full">
                        {method.action}
                      </Button>
                    </Card.Content>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <Card.Header>
                  <Card.Title>Send us a Message</Card.Title>
                  <Card.Description>
                    Fill out the form below and we'll get back to you as soon as possible
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  {submitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600">
                        Thank you for contacting us. We'll respond within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Your full name"
                        />
                        <Input
                          label="Email Address"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Phone Number"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+251 9X XXX XXXX"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Inquiry Type
                          </label>
                          <select
                            name="inquiryType"
                            value={formData.inquiryType}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            required
                          >
                            {inquiryTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <Input
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Brief description of your inquiry"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Message
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                          placeholder="Please provide details about your inquiry..."
                        />
                      </div>

                      <Button
                        type="submit"
                        loading={isSubmitting}
                        leftIcon={<Send className="h-4 w-4" />}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? 'Sending Message...' : 'Send Message'}
                      </Button>
                    </form>
                  )}
                </Card.Content>
              </Card>
            </motion.div>

            {/* FAQ and Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Business Hours */}
              <Card>
                <Card.Header>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <Card.Title>Business Hours</Card.Title>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saturday</span>
                      <span className="font-medium">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sunday</span>
                      <span className="font-medium">Closed</span>
                    </div>
                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Support</span>
                        <span className="font-medium text-green-600">24/7 Available</span>
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>

              {/* FAQ */}
              <Card>
                <Card.Header>
                  <Card.Title>Frequently Asked Questions</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      View All FAQs
                    </Button>
                  </div>
                </Card.Content>
              </Card>

              {/* Social Media */}
              <Card>
                <Card.Header>
                  <Card.Title>Follow Us</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="flex space-x-4">
                    {[
                      { Icon: Facebook, color: 'text-blue-600 hover:bg-blue-50' },
                      { Icon: Twitter, color: 'text-sky-500 hover:bg-sky-50' },
                      { Icon: Instagram, color: 'text-pink-600 hover:bg-pink-50' },
                      { Icon: Linkedin, color: 'text-blue-700 hover:bg-blue-50' }
                    ].map(({ Icon, color }, index) => (
                      <button
                        key={index}
                        className={`p-3 rounded-lg border transition-colors ${color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-4">
                    Stay updated with the latest news, promotions, and food trends!
                  </p>
                </Card.Content>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ContactPage;