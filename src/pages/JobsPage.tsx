
import { JobList } from '@/components/jobs/JobList';
import { Header } from '@/components/layout/Header';

const JobsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
          <p className="text-gray-600 mt-2">Find your next opportunity</p>
        </div>
        <JobList />
      </main>
    </div>
  );
};

export default JobsPage;
