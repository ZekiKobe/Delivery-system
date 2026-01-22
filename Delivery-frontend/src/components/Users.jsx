import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Card, Button } from './ui';

const Users = () => {
  // Mock users data for demonstration
  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+251 91 234 5678',
      address: 'Addis Ababa, Ethiopia',
      joinDate: '2023-01-15',
      totalOrders: 47,
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+251 91 345 6789',
      address: 'Dire Dawa, Ethiopia',
      joinDate: '2023-02-20',
      totalOrders: 23,
      status: 'active'
    },
    {
      id: 3,
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      phone: '+251 91 456 7890',
      address: 'Bahir Dar, Ethiopia',
      joinDate: '2023-03-10',
      totalOrders: 65,
      status: 'inactive'
    }
  ];

  const getStatusColor = (status) => {
    return status === 'active' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Users Management</h1>
        <p className="text-gray-600">Manage and view all registered users</p>
      </div>

      <div className="grid gap-6">
        {users.map((user, index) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {user.totalOrders} orders
                  </p>
                  <div className="flex space-x-2 mt-3">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Users;