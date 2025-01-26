import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, MapPin, Clock, Building2, DollarSign, Filter, ChevronRight, Loader2, GraduationCap, Calendar, Bookmark, Share2, ArrowUpRight, CheckCircle2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

const JobSearchPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    industry: '',
    experience: ''
  });
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, filters, jobs]);

  const fetchJobs = async () => {
    const companyName = localStorage.getItem('companyName');
    if (!companyName) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/company-jobs/${companyName}`);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
      setFilteredJobs(data);
      if (data.length > 0) setSelectedJob(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];
    
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.job_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.job_desc?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => 
        job.mode?.toLowerCase().includes(filters.jobType.toLowerCase())
      );
    }

    if (filters.experience) {
      filtered = filtered.filter(job => 
        job.job_yrs_of_exp?.toString() === filters.experience
      );
    }

    setFilteredJobs(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const shareJob = (job) => {
    if (navigator.share) {
      navigator.share({
        title: job.job_title,
        text: `Check out this ${job.job_title} position at ${job.companyWebsite}`,
        url: window.location.href,
      });
    }
  };

  const JobCard = ({ job, isSelected }) => (
    <Card 
      className={`
        cursor-pointer transition-all duration-300 border-2 
        ${isSelected 
          ? 'border-l-orange-500 bg-orange-100 shadow-lg' 
          : 'border-l-orange-500 hover:border-l-orange-300 hover:bg-gray-50'}
      `}
      onClick={() => setSelectedJob(job)}
    >
      <CardContent className="p-4 noborder">
        <div className="flex gap-4 noborder">
          <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 noborder">
            <Building2 className="w-6 h-6 text-orange-600 noborder" />
          </div>
          <div className="flex-1 min-w-0 noborder">
            <div className="flex items-start justify-between noborder">
              <div className=' noborder'>
                <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-orange-600 noborder">
                  {job.job_title}
                </h3>
                <p className="text-sm text-gray-600 mb-2 noborder">{job.companyWebsite}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveJob(job.job_id);
                }}
                className="text-gray-400 hover:text-orange-500 noborder"
              >
                <Bookmark 
                  className={`w-5 h-5 noborder ${savedJobs.includes(job.job_id) ? 'fill-orange-500 text-orange-500' : ''}`} 
                />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 noborder">
              <span className="flex items-center gap-1 text-sm bg-orange-200 text-orange-700 px-2 py-1 rounded-full">
                <MapPin className="w-3 h-3 noborder" />
                {job.location || 'Remote'}
              </span>
              <span className="flex items-center gap-1 text-sm bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3 noborder" />
                {job.mode || 'Full Time'}
              </span>
              <span className="flex items-center gap-1 text-sm bg-green-200 text-green-700 px-2 py-1 rounded-full">
                <GraduationCap className="w-3 h-3 noborder" />
                {job.job_yrs_of_exp}+ years
              </span>
            </div>
            {isSelected && (
              <div className="mt-2 flex items-center text-sm text-orange-600 noborder">
                <CheckCircle2 className="w-4 h-4 mr-1 noborder" />
                Selected Position
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const JobDetail = ({ job }) => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b sticky top-0 bg-white z-10">
        <div className=' noborder'>
          <CardTitle className="text-2xl font-bold noborder">{job.job_title}</CardTitle>
          <p className="text-gray-600 mt-1 noborder">{job.companyWebsite}</p>
        </div>
        <div className="flex gap-2 noborder">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => shareJob(job)}
            className="rounded-full border-orange-600"
          >
            <Share2 className="w-4 h-4 noborder" />
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={() => toggleSaveJob(job.job_id)}
            className={`rounded-full border-orange-600 ${
              savedJobs.includes(job.job_id) 
                ? 'bg-orange-300 text-orange-600 border-orange-200' 
                : ''
            }`}
          >
            <Bookmark className="w-4 h-4 noborder" />
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 noborder">
            Apply Now <ArrowUpRight className="w-4 h-4 ml-2 noborder" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)] custom-scrollbar">
        <div className="grid grid-cols-2 gap-4 mt-6 noborder">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            <Building2 className="w-5 h-5 text-orange-500 noborder" />
            <div className=' noborder'>
              <p className="text-lg text-orange-500 noborder">Company</p>
              <p className="font-medium noborder">{job.companyWebsite}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            <MapPin className="w-5 h-5 text-orange-500 noborder" />
            <div className=' noborder'>
              <p className="text-lg text-orange-500 noborder">Location</p>
              <p className="font-medium noborder">{job.location || 'Remote'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            <DollarSign className="w-5 h-5 text-orange-500 noborder" />
            <div className=' noborder'>
              <p className="text-lg text-orange-500 noborder">Salary Range</p>
              <p className="font-medium noborder">{job.ctc || 'Competitive'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
            <Users className="w-5 h-5 text-orange-500 noborder" />
            <div className=' noborder'>
              <p className="text-lg text-orange-500 noborder">Experience Required</p>
              <p className="font-medium noborder">{job.job_yrs_of_exp || 'Not Mentioned'}+ years</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50/50 p-6 rounded-lg border border-orange-100">
          <h3 className="text-lg font-semibold mb-4 noborder">Job Overview</h3>
          <div className="grid grid-cols-2 gap-4 noborder">
            <div className="flex items-center gap-2 pl-5 border-orange-400 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-500 noborder" />
              <div className='p-3 noborder'>
                <p className="text-lg text-gray-600 text-orange-600 noborder">Posted Date</p>
                <p className="font-medium noborder">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-5 border-orange-400 rounded-lg">
              <Clock className="w-5 h-5 text-orange-500 noborder" />
              <div className='noborder p-3'>
                <p className="text-lg text-gray-600 text-orange-600 noborder">Job Type</p>
                <p className="font-medium noborder">{job.mode || 'Full Time'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className='border-orange-100'>
          <h3 className="text-lg font-semibold mb-3 p-3 bg-orange-200 noborder">Job Description</h3>
          <div className="prose prose-gray max-w-none p-3 noborder">
            <p className="text-gray-600 whitespace-pre-line noborder">{job.job_desc}</p>
          </div>
        </div>

        <div className='border-orange-100'>
          <h3 className="text-lg font-semibold mb-3 p-3 bg-orange-200 noborder">Qualifications</h3>
          <div className="prose prose-gray max-w-none p-3 noborder">
            <p className="text-gray-600 noborder">{job.qualifications}</p>
          </div>
        </div>

        <div className='border-orange-100'>
          <h3 className="text-lg font-semibold mb-3 p-3 bg-orange-200 noborder">Required Skills</h3>
          <div className="flex flex-wrap gap-2 p-3 noborder">
            {job.skills?.split(',').map((skill, index) => (
              <span 
                key={index} 
                className="px-3 py-1.5 bg-orange-300 text-gray-800 rounded-full text-sm font-medium hover:bg-orange-400 transition-colors noborder"
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-800 noborder">
        <div className="text-xl font-semibold mb-2 noborder">Oops! Something went wrong</div>
        <p className="text-gray-600 mb-4 noborder">{error}</p>
        <Button onClick={fetchJobs}>Try Again</Button>
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
            <div className="max-w-7xl mx-auto noborder">
              <div className="mb-6 noborder">
                <h1 className="text-2xl font-bold text-gray-900 noborder">Find your dream job</h1>
                <p className="text-gray-600 noborder">Looking for jobs? Browse our latest job openings to view</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6 noborder">
                <div className="lg:col-span-2 relative noborder">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 noborder" />
                  <Input
                    type="text"
                    placeholder="Search for a job..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Location"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                />
                <Input
                  type="text"
                  placeholder="Job Type"
                  name="jobType"
                  value={filters.jobType}
                  onChange={handleFilterChange}
                />
                <Input
                  type="text"
                  placeholder="Experience"
                  name="experience"
                  value={filters.experience}
                  onChange={handleFilterChange}
                />
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[60vh] noborder">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600 noborder" />
                  <p className="mt-4 text-gray-600 noborder">Loading available positions...</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6 noborder">
                  <div className="lg:col-span-1 overflow-y-auto max-h-[calc(100vh-16rem)] custom-scrollbar space-y-4 pr-2 noborder">
                    {filteredJobs.map((job) => (
                      <JobCard 
                        key={job.job_id} 
                        job={job} 
                        isSelected={selectedJob?.job_id === job.job_id}
                      />
                    ))}
                    {filteredJobs.length === 0 && (
                      <Card className="p-8 text-center noborder">
                        <Briefcase className="w-12 h-12 mx-auto text-gray-400 noborder" />
                        <h3 className="mt-4 text-lg font-semibold noborder">No jobs found</h3>
                        <p className="mt-2 text-gray-600 noborder">
                          Try adjusting your search or filters
                        </p>
                      </Card>
                    )}
                  </div>
                  <div className="lg:col-span-2 noborder">
                    {selectedJob && <JobDetail job={selectedJob} />}
                  </div>
                </div>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default JobSearchPage;

