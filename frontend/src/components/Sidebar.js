import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Search, Briefcase, GraduationCap, Clock, Trophy, MessageSquare, Bell, UserCircle, Plus, Calendar, LogOut } from 'lucide-react'

import { Sidebar, SidebarProvider } from './ui/sidebar'

const SidebarWrapper = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FileText, label: 'Resume', path: '/resume', action: 'Update' },
    { icon: Search, label: 'Job Search', path: '/job-search' },
    { icon: Briefcase, label: 'Applications', path: '/applications' },
    { icon: GraduationCap, label: 'Skills', path: '/skills', action: 'Add' },
    { icon: Clock, label: 'Education', path: '/education', action: 'Add' },
    { icon: Clock, label: 'Experience', path: '/experience' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: Calendar, label: 'Leave Management', path: '/leave-management' },
    // { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: UserCircle, label: 'Profile', path: '/profile' },
    { icon: LogOut, label: 'Termination Request', path: '/termination-request' }
  ]

  return (
    <Sidebar className="bg-background">
      {/* Logo */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          <h1 className="font-bold h-12 rounded-lg bg-orange-400 flex items-center justify-center border-none w-full">
            <span className="text-primary border-none">Quick Links</span>
          </h1>
        </div>
      </div>
      <div className="px-3 py-4 overflow-y-auto">
        <ul className="space-y-2 font-medium border-none">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-2 text-gray-900 rounded-lg hover:bg-orange-200 border-none ${
                  isActive(item.path) ? 'bg-orange-300' : ''
                }`}
              >
                <item.icon className="w-6 h-6 text-orange-500 transition duration-75 border-none" />
                <span className="ml-3 border-none">{item.label}</span>
                {item.action && (
                  <button className="ml-auto text-xs text-orange-500 hover:text-orange-700 border-none">
                    {item.action}
                  </button>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Sidebar>
  )
}

export default SidebarWrapper

