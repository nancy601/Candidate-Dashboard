import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, UserCircle } from 'lucide-react'

import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { SidebarTrigger } from './ui/sidebar'

const Header = () => {
  const navigate = useNavigate()

  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const employeeId = localStorage.getItem('employeeId');
      const companyName = localStorage.getItem('companyName');
      if (employeeId && companyName) {
        try {
          const response = await fetch(`http://localhost:5000/api/notifications/${companyName}/${employeeId}`);
          if (response.ok) {
            const data = await response.json();
            const lastReadTimestamp = localStorage.getItem('lastReadNotificationTimestamp') || '0';
            const unread = data.filter(notification => new Date(notification.timestamp) > new Date(lastReadTimestamp));
            setNotifications(data);
            setUnreadNotifications(unread);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Fetch every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === '/notifications') {
        markNotificationsAsRead();
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId')
    navigate('/')
  }

  const markNotificationsAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastReadNotificationTimestamp', now);
    setUnreadNotifications([]);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-none">
      <div className="container flex h-14 items-center gap-4 border-none">
        <SidebarTrigger />
        <div className="flex-1 flex items-center gap-4 md:gap-6 border-none">
          <form className="flex-1 hidden md:flex max-w-2xl border-none">
            <div className="relative w-full border-none">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground border-none" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="w-full pl-8 bg-background"
              />
            </div>
          </form>
          <div className="flex items-center gap-6 border-none" style={{ marginLeft: "907px" }}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={markNotificationsAsRead}>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 noborder" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center noborder">
                      {unreadNotifications.length}
                    </span>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 noborder">
                {notifications.length > 0 ? (
                  <>
                    {notifications.slice(0, 2).map((notification, index) => (
                      <DropdownMenuItem key={index} className="flex flex-col items-start p-2 noborder">
                        <span className="font-medium bg-orange-200 w-full p-2 rounded-t-lg noborder">{notification.title}</span>
                        <span className="text-sm text-gray-500 bg-orange-100 w-full p-2 rounded-b-lg noborder">{notification.message}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem asChild>
                      <Button className="w-full my-2 noborder" onClick={() => {
                        markNotificationsAsRead();
                        navigate('/notifications');
                      }}>
                        View all notifications
                      </Button>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem>No new notifications</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={()=>navigate('/profile')}
            >
              <UserCircle className="w-5 h-5 border-none"/>
            </Button>
            <Button variant="default" onClick={handleLogout} className=" noborder">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

