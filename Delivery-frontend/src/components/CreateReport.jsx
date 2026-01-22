import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, User, TrendingUp, Download, Filter } from 'lucide-react';
import { Card, Button, Input } from './ui';

const CreateReport = () => {
  const [reportType, setReportType] = useState('orders');
  const [dateRange, setDateRange] = useState('last30days');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'orders', name: 'Orders Report', icon: FileText },
    { id: 'users', name: 'Users Report', icon: User },
    { id: 'revenue', name: 'Revenue Report', icon: TrendingUp },
    { id: 'delivery', name: 'Delivery Report', icon: FileText }
  ];

  const dateRanges = [
    { id: 'today', name: 'Today' },
    { id: 'yesterday', name: 'Yesterday' },
    { id: 'last7days', name: 'Last 7 Days' },
    { id: 'last30days', name: 'Last 30 Days' },
    { id: 'last3months', name: 'Last 3 Months' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In a real app, this would generate and download the report
    console.log('Report generated:', {
      type: reportType,
      dateRange,
      customDateFrom,
      customDateTo
    });
    
    setIsGenerating(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Report</h1>
        <p className="text-gray-600">Generate comprehensive reports for your delivery service</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <Card>
            <Card.Header>
              <Card.Title>Report Type</Card.Title>
              <Card.Description>Choose the type of report you want to generate</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 gap-4">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setReportType(type.id)}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        reportType === type.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${
                          reportType === type.id ? 'text-orange-600' : 'text-gray-600'
                        }`} />
                        <span className="font-medium">{type.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card.Content>
          </Card>

          {/* Date Range Selection */}
          <Card>
            <Card.Header>
              <Card.Title>Date Range</Card.Title>
              <Card.Description>Select the time period for your report</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {dateRanges.map((range) => (
                    <button
                      key={range.id}
                      onClick={() => setDateRange(range.id)}
                      className={`p-3 border rounded-lg text-sm font-medium transition-all ${
                        dateRange === range.id
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {range.name}
                    </button>
                  ))}
                </div>

                {dateRange === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-4 pt-4 border-t"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                      </label>
                      <Input
                        type="date"
                        value={customDateFrom}
                        onChange={(e) => setCustomDateFrom(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                      </label>
                      <Input
                        type="date"
                        value={customDateTo}
                        onChange={(e) => setCustomDateTo(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Additional Filters */}
          <Card>
            <Card.Header>
              <Card.Title>Additional Filters</Card.Title>
              <Card.Description>Optional filters to refine your report</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">All Restaurants</option>
                    <option value="traditional">Traditional Ethiopian</option>
                    <option value="pizza">Pizza Palace</option>
                    <option value="burger">Burger House</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option value="">All Statuses</option>
                    <option value="delivered">Delivered</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>

        {/* Report Preview/Summary */}
        <div className="space-y-6">
          <Card>
            <Card.Header>
              <Card.Title>Report Summary</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{reportType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Period:</span>
                  <span className="font-medium">
                    {dateRanges.find(r => r.id === dateRange)?.name}
                  </span>
                </div>
                {dateRange === 'custom' && customDateFrom && customDateTo && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {customDateFrom} to {customDateTo}
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <Card.Title>Export Options</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Include charts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Include detailed data</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Send via email</span>
                </label>
              </div>
            </Card.Content>
          </Card>

          <Button
            onClick={handleGenerateReport}
            loading={isGenerating}
            leftIcon={<Download className="h-4 w-4" />}
            className="w-full"
            size="lg"
          >
            {isGenerating ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateReport;