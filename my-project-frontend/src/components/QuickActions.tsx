import { NavLink } from 'react-router-dom';
import { BookOpen, Brain, TrendingUp, Users, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
  color: string;
}

export const QuickActions = () => {
  const actions: QuickAction[] = [
    {
      title: 'Upload Notes',
      description: 'Add new study materials',
      icon: BookOpen,
      to: '/notes',
      color: 'text-blue-500',
    },
    {
      title: 'Generate Test',
      description: 'Create AI-powered mock test',
      icon: Brain,
      to: '/mock-tests',
      color: 'text-purple-500',
    },
    {
      title: 'View Progress',
      description: 'Track your learning stats',
      icon: TrendingUp,
      to: '/progress',
      color: 'text-green-500',
    },
    {
      title: 'Teacher Panel',
      description: 'Review pending notes',
      icon: Users,
      to: '/teacher/verification',
      color: 'text-orange-500',
    },
    // {
    //   title: 'Admin Dashboard',
    //   description: 'System analytics',
    //   icon: Settings,
    //   to: '/admin/dashboard',
    //   color: 'text-red-500',
    // },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <NavLink key={index} to={action.to}>
          <Card className="group hover:shadow-card-hover transition-base border-border bg-card rounded-xl cursor-pointer h-full">
            <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-full bg-primary/10 group-hover:scale-110 transition-base`}>
                <action.icon className={`h-6 w-6 ${action.color}`} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        </NavLink>
      ))}
    </div>
  );
};
