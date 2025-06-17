
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { JobCard } from './JobCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

type Job = Tables<'jobs'> & {
  job_categories: Tables<'job_categories'> | null;
  profiles: Tables<'profiles'>;
};

type Category = Tables<'job_categories'>;

interface JobListProps {
  jobs: Job[];
}

export const JobList = ({ jobs }: JobListProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [budgetFilter, setBudgetFilter] = useState<string>('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('job_categories')
      .select('*')
      .order('name');
    
    setCategories(data || []);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           job.job_categories?.id === selectedCategory;
    
    const matchesBudget = budgetFilter === 'all' || 
                         (budgetFilter === 'low' && job.budget_max && job.budget_max <= 500) ||
                         (budgetFilter === 'medium' && job.budget_max && job.budget_max > 500 && job.budget_max <= 2000) ||
                         (budgetFilter === 'high' && job.budget_max && job.budget_max > 2000);
    
    return matchesSearch && matchesCategory && matchesBudget;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={budgetFilter} onValueChange={setBudgetFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Budget" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">All Budgets</SelectItem>
            <SelectItem value="low">Under $500</SelectItem>
            <SelectItem value="medium">$500 - $2,000</SelectItem>
            <SelectItem value="high">$2,000+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
