import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, OrderProvider, NotificationProvider, DeliveryProvider } from './context';
import { ToastContainer } from './components/ToastNotification/ToastNotification';
import { useNotification } from './context';
import LandingPage from './pages/LandingPage/landingPage';
import Login from './pages/LoginPage/Login';
import Registration from './pages/RegisterationPage/Registration';
import DeliveryPersonRegistration from './pages/RegisterationPage/DeliveryPersonRegistration';
import BusinessOwnerRegistration from './pages/RegisterationPage/BusinessOwnerRegistration';
import BusinessSetup from './pages/BusinessSetupPage/BusinessSetup';
import ForgotPasswordPage from './pages/ForgotPasswordPage/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage/OAuthCallbackPage';
import ProfileCompletePage from './pages/ProfileCompletePage/ProfileCompletePage';
import RestaurantsPage from './pages/RestaurantsPage/RestaurantsPage';
import BusinessesPage from './pages/BusinessesPage/BusinessesPage';
import OrderTrackingPage from './pages/OrderTrackingPage/OrderTrackingPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import MenuPage from './pages/MenuPage/MenuPage';
import SettingsPage from './pages/SettingsPage/SettingsPage';
import OrdersPage from './pages/OrdersPage/OrdersPage';
import ContactPage from './pages/ContactPage/ContactPage';
import HelpPage from './pages/HelpPage/HelpPage';
import AboutPage from './pages/AboutPage/AboutPage';
import TailwindTest from './components/TailwindTest/TailwindTest';
import './App.css';
import './styles/responsive.css';

// Inner App component to access notification context
const AppContent = () => {
  const { notifications } = useNotification();
  
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/register/delivery" element={<DeliveryPersonRegistration />} />
        <Route path="/register/business" element={<BusinessOwnerRegistration />} />
        <Route path="/business-setup" element={<BusinessSetup />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/profile/complete" element={<ProfileCompletePage />} />
        <Route path="/restaurants" element={<RestaurantsPage />} />
        <Route path="/businesses" element={<BusinessesPage />} />
        <Route path="/restaurant/:restaurantId" element={<MenuPage />} />
        <Route path="/business/:businessId" element={<MenuPage />} />
        <Route path="/track" element={<OrderTrackingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Terms and Conditions Routes */}
        <Route path="/terms" element={<div className="p-8 max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-4">General Terms and Conditions</h1><p>Terms content will be loaded here...</p></div>} />
        <Route path="/terms-business" element={<div className="p-8 max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-4">Business Terms and Conditions</h1><p>Business terms content will be loaded here...</p></div>} />
        <Route path="/terms-delivery" element={<div className="p-8 max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-4">Delivery Partner Terms</h1><p>Delivery terms content will be loaded here...</p></div>} />
        <Route path="/privacy" element={<div className="p-8 max-w-4xl mx-auto"><h1 className="text-2xl font-bold mb-4">Privacy Policy</h1><p>Privacy policy content will be loaded here...</p></div>} />
        
        {/* Tailwind CSS Test Route - Remove after verification */}
        <Route path="/tailwind-test" element={<TailwindTest />} />
        
        {/* Additional utility routes */}
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      
      {/* Global Toast Notifications */}
      <Toaster
        position="top-left"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
          error: {
            duration: 5000,
            theme: {
              primary: '#f56565',
            },
          },
        }}
      />
      
      {/* Custom Toast Notifications */}
      <ToastContainer 
        notifications={notifications}
        position="top-left"
        maxToasts={3}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <NotificationProvider>
          <DeliveryProvider>
            <AppContent />
          </DeliveryProvider>
        </NotificationProvider>
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;