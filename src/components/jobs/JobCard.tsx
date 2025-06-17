
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, User } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';

type Job = Tables<'jobs'> & {
  job_categories: Tables<'job_categories'> | null;
  profiles: Tables<'profiles'>;
};

interface JobCardProps {
  job: Job;
}

export const JobCard = ({ job }: JobCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatBudget = (min?: number | null, max?: number | null) => {
    if (min && max) {
      return `$${min} - $${max}`;
    } else if (min) {
      return `$${min}+`;
    } else if (max) {
      return `Up to $${max}`;
    }
    return 'Budget not specified';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">
              <Link to={`/jobs/${job.id}`} className="hover:text-blue-600">
                {job.title}
              </Link>
            </CardTitle>
            <CardDescription 
              className="line-clamp-3" 
              dangerouslySetInnerHTML={{ __html: job.description.substring(0, 150) + '...' }} 
            />
          </div>
          <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
            {job.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>{formatBudget(job.budget_min, job.budget_max)}</span>
            </div>
            {job.deadline && (
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Due: {formatDate(job.deadline)}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Posted by {job.profiles.full_name}</span>
            </div>
            {job.job_categories && (
              <Badge variant="outline">{job.job_categories.name}</Badge>
            )}
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-gray-500">
              Posted {formatDate(job.created_at)}
            </span>
            <Link to={`/jobs/${job.id}`}>
              <Button size="sm">View Details</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
