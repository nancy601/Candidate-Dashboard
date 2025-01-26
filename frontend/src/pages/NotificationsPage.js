import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, FileText, Briefcase, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Button } from '../atoms/Button';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    markNotificationsAsRead();
  }, []);

  const fetchNotifications = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/notifications/${companyName}/${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationsAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastReadNotificationTimestamp', now);
    // You might want to add an API call here to update the read status on the server
  };

  const handleNotificationAction = (notification) => {
    switch (notification.type) {
      case 'job_application':
        navigate(`/applications`);
        break;
      case 'profile_completion':
        navigate('/profile');
        break;
      case 'education_update':
        navigate('/dashboard');
        break;
      case 'resume_upload':
        navigate('/resume');
        break;
      case 'skills_update':
        navigate('/dashboard');
        break;
      default:
        console.log('No action defined for this notification type');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_application':
        return <Briefcase className="w-5 h-5 text-orange-500 noborder" />;
      case 'profile_completion':
        return <AlertCircle className="w-5 h-5 text-yellow-500 noborder" />;
      case 'education_update':
        return <FileText className="w-5 h-5 text-green-500 noborder" />;
      case 'resume_upload':
        return <FileText className="w-5 h-5 text-purple-500 noborder" />;
      case 'skills_update':
        return <CheckCircle className="w-5 h-5 text-indigo-500 noborder" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500 noborder" />;
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-800 noborder">
        <div className="text-xl font-semibold mb-2 noborder">Oops! Something went wrong</div>
        <p className="text-gray-600 mb-4 noborder">{error}</p>
        <Button onClick={fetchNotifications}>Try Again</Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen noborder">
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="p-6 bg-gray-50 noborder">
            <div className="max-w-4xl mx-auto noborder">
              <div className="mb-6 noborder">
                <h1 className="text-2xl font-bold text-gray-900 noborder">Notifications</h1>
                <p className="text-gray-600 noborder">Stay updated with your latest activities and opportunities</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center noborder">
                    <Bell className="mr-2 noborder" />
                    All Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 noborder">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-500 noborder" />
                      <p className="mt-4 text-gray-600 noborder">Loading notifications...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    <ul className="space-y-4 noborder">
                      {notifications.map((notification, index) => (
                        <li key={index} className="flex items-start p-4 bg-white rounded-lg shadow noborder">
                          <div className="flex-shrink-0 mr-4 noborder">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow noborder">
                            <h3 className="text-lg font-medium text-gray-900 noborder">{notification.title}</h3>
                            <p className="mt-1 text-sm text-orange-500 noborder">{notification.message}</p>
                            <div className="mt-2 flex items-center justify-between noborder">
                              <Button 
                                onClick={() => handleNotificationAction(notification)}
                                variant="default" 
                                size="sm"
                                className="m-3 noborder"
                              >
                                View Details
                              </Button>
                              <span className="text-xs text-gray-400 noborder">
                                {new Date(notification.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-12 noborder">
                      <Bell className="mx-auto h-12 w-12 text-gray-400 noborder" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 noborder">No notifications</h3>
                      <p className="mt-1 text-sm text-gray-500 noborder">You're all caught up!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NotificationsPage;

