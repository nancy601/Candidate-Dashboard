import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const RecentActivity = ({ activities }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[300px]">
        {activities.length > 0 ? (
          <div className="space-y-4 border-none">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 group border-none">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors border-none">
                  <activity.icon className="w-5 h-5 text-orange-600 border-none" />
                </div>
                <div className="flex-1 space-y-1 border-none">
                  <p className="text-sm font-medium text-gray-900 border-none">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center border-none">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3 border-none">
              <activity.icon className="w-6 h-6 text-orange-600 border-none" />
            </div>
            <p className="text-sm text-gray-500 border-none">No recent activities to display.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;

