import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

const ProfileCompletion = ({ tasks }) => {
  const completedTasks = tasks.filter(task => task.completed);
  const completionPercentage = (completedTasks.length / tasks.length) * 100;

  return (
    <Card>
      <CardHeader className="border-none">
        <CardTitle className="flex items-center justify-between border-none">
          <span className='ml-20 px-20 border-none'>Profile Completion</span>
          <span className="text-orange-600 text-base border-none">{completionPercentage.toFixed(0)}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="border-none">
        <Progress value={completionPercentage} className="h-2 mb-6 bg-orange-100" />
        <div className="space-y-4 border-none">
          {tasks.map((task, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-colors border-none",
                task.completed 
                  ? "bg-orange-50 text-orange-600" 
                  : "bg-gray-50 text-gray-600"
              )}
            >
              <div className="flex items-center gap-3 border-none">
                <div className={cn(
                  "w-2 h-2 rounded-full border-none",
                  task.completed ? "bg-orange-500" : "bg-gray-300"
                )} />
                <span className="text-sm font-medium border-none">{task.title}</span>
              </div>
              <span className="text-sm font-medium border-none">{task.completed ? '100%' : '0%'}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCompletion;

