// User interfaces
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'customer' | 'business_owner' | 'delivery_person' | 'admin';
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  businessProfile?: {
    businessType: string;
    businessId: string;
    verificationStatus: string;
  };
  deliveryPersonProfile?: {
    vehicleType: string;
    licenseNumber: string;
    isAvailable: boolean;
  };
}

export interface UserStats {
  totalUsers: number;
  newUsersThisMonth: number;
  byRole: Array<{
    _id: string;
    count: number;
    active: number;
    verified: number;
  }>;
  summary: {
    customers: number;
    businessOwners: number;
    deliveryPersons: number;
    admins: number;
  };
}

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: Pagination;
  };
}

// Business interfaces
export interface Business {
  _id: string;
  name: string;
  description: string;
  businessType: 'restaurant' | 'retail' | 'services';
  category: string[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
  };
  owner: string | User;
  isActive: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating: {
    average: number;
    count: number;
  };
  totalOrders: number;
  revenue: {
    total: number;
    thisMonth: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BusinessesResponse {
  success: boolean;
  data: {
    businesses: Business[];
    pagination: Pagination;
  };
}

// Order interfaces
export interface OrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: Array<{
    groupId: string;
    groupName: string;
    optionId: string;
    optionName: string;
    price: number;
  }>;
  specialInstructions?: string;
  subtotal: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer: string | User;
  restaurant: string | Business;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'assigned' | 'on_the_way' | 'delivered' | 'cancelled';
  totalAmount: number;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  deliveryPerson?: string | User;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  customerNotes?: string;
  scheduledFor?: string;
  statusUpdates: Array<{
    status: string;
    updatedBy: string;
    timestamp: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: Pagination;
  };
}

// Analytics interfaces
export interface DashboardStats {
  success: boolean;
  data: {
    overview: {
      totalUsers: number;
      totalBusinesses: number;
      totalOrders: number;
      totalRevenue: number;
    };
    recentActivity: {
      orders: number;
      users: number;
      businesses: number;
      revenue: number;
    };
    distributions: {
      orderStatus: Array<{
        _id: string;
        count: number;
      }>;
      userRoles: Array<{
        _id: string;
        count: number;
      }>;
      businessTypes: Array<{
        _id: string;
        count: number;
      }>;
    };
  };
}

export interface AnalyticsData {
  success: boolean;
  data: {
    type: string;
    period: string;
    groupBy: string;
    data: Array<{
      _id: string;
      count?: number;
      revenue?: number;
      avgOrderValue?: number;
      orderCount?: number;
      byRole?: Array<{
        role: string;
        count: number;
      }>;
      byType?: Array<{
        businessType: string;
        count: number;
      }>;
    }>;
  };
}

// Common interfaces
export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers?: number;
  totalBusinesses?: number;
  totalOrders?: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form interfaces
export interface CreateUserForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserForm {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface BulkOperation {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'verify';
  data?: any;
}

// Verification interfaces
export interface VerificationApplication {
  _id: string;
  applicationNumber: string;
  business: {
    _id: string;
    name: string;
    businessType: string;
    contact: {
      email: string;
      phone: string;
    };
  };
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  overallStatus: 'draft' | 'submitted' | 'under_review' | 'additional_info_required' | 'approved' | 'rejected' | 'suspended';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  submittedAt: string;
  reviewStartedAt?: string;
  completedAt?: string;
  assignedReviewer?: string;
  documents: VerificationDocument[];
  businessInfo: {
    registrationNumber?: string;
    taxId?: string;
    establishedYear?: number;
    employeeCount?: string;
    monthlyRevenue?: string;
  };
  ownerVerification: {
    identityVerified: boolean;
    addressVerified: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
  };
  reviewHistory: Array<{
    reviewedBy: string;
    status: string;
    comments: string;
    changesRequested: string[];
    reviewedAt: string;
  }>;
  additionalInfoRequests: Array<{
    message: string;
    documentsRequested: string[];
    dueDate: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationDocument {
  _id: string;
  type: string;
  name: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  isRequired: boolean;
}

export interface VerificationStats {
  summary: {
    totalApplications: number;
    pendingReview: number;
    approved: number;
    rejected: number;
  };
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  monthlyTrends: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
    approved: number;
    rejected: number;
  }>;
  businessTypeDistribution: Array<{
    _id: string;
    count: number;
  }>;
}