import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, Building2, Users, Brain, FileText, MapPin, Info, AlertCircle, Loader2, Video, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Button } from '../atoms/Button';

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/candidate-applications/${companyName}/${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
      if (data.length > 0) {
        setSelectedApplication(data[0]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getZoomLink = (application) => {
    if (application.gd_data && application.gd_data.length > 0) {
      const gdSession = JSON.parse(application.gd_data)[0];
      return gdSession.join_url;
    }
    return null;
  };

  const getMBTILink = (application) => {
    if (application.mbti_data && application.mbti_data.length > 0) {
      const mbtiData = JSON.parse(application.mbti_data)[0];
      return mbtiData.mbti_test_url;
    }
    return null;
  };

  const ApplicationCard = ({ application, isSelected, onClick }) => (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-l-4 border-l-primary bg-primary/5' 
          : 'hover:border-l-4 hover:border-l-primary/50'
      }`}
      onClick={() => onClick(application)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4 noborder">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 noborder">
            <Building2 className="w-5 h-5 text-orange-600 noborder" />
          </div>
          <div className="flex-1 min-w-0 noborder">
            <h3 className="text-base font-semibold text-gray-900 truncate noborder">
              {application.job_title}
            </h3>
            <p className="text-sm text-gray-600 truncate noborder">{application.comp_name}</p>
            <div className="flex items-center gap-2 mt-2 noborder">
              <span className="text-xs text-gray-500 flex items-center noborder">
              <MapPin className="w-3 h-3 text-orange-500 noborder" />
              <p className="text-sm text-gray-600 truncate noborder">{application.job_location}</p>
            </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2 noborder">
              <span className="text-xs text-orange-500 flex items-center noborder">
                <Calendar className="w-3 h-3 mr-1 noborder" />
                {new Date(application.application_date).toLocaleDateString()}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 noborder">
                Invited
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen noborder">
        <Loader2 className="w-8 h-8 animate-spin text-primary noborder" />
        <p className="mt-4 text-gray-600 noborder">Loading your applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-800 noborder">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 noborder" />
        <h3 className="text-xl font-semibold mb-2 noborder">Oops! Something went wrong</h3>
        <p className="text-gray-600 mb-4 noborder">{error}</p>
        <Button onClick={fetchApplications}>Try Again</Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen">
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="p-6 pb-12 bg-gray-50/50 noborder">
            <div className="max-w-7xl mx-auto noborder">
              <div className="flex items-center justify-between mb-6 noborder">
                <div className="noborder">
                  <h1 className="text-2xl font-bold text-gray-900 noborder">My Applications</h1>
                  <p className="text-gray-600 noborder">Track your job applications and assessment progress</p>
                </div>
                <Button 
                  onClick={() => navigate('/job-search')}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Find More Jobs
                </Button>
              </div>

              {applications.length > 0 ? (
                <div className="grid lg:grid-cols-3 gap-6 noborder h-[calc(100vh-200px)]">
                  <div className="lg:col-span-1 space-y-4 noborder overflow-y-auto pr-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {applications.map((application) => (
                      <ApplicationCard
                        key={application.job_id}
                        application={application}
                        isSelected={selectedApplication?.job_id === application.job_id}
                        onClick={setSelectedApplication}
                      />
                    ))}
                  </div>
                  
                  {selectedApplication && (
                    <div className="lg:col-span-2 space-y-6 noborder overflow-y-auto pr-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                      <Card>
                        <CardHeader className="border-b">
                          <div className="flex items-center justify-between noborder">
                            <div className=' noborder'>
                              <CardTitle className="text-xl font-bold noborder">
                                {selectedApplication.job_title}
                              </CardTitle>
                              {/* <p className="text-gray-600 mt-1 noborder">{selectedApplication.comp_name}</p> */}
                            </div>
                            <Button size="lg">
                              Start Assessment
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 noborder">
                          <div className="grid grid-cols-2 gap-4 mb-8 noborder">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50/80">
                              <Building2 className="w-5 h-5 text-gray-500 noborder" />
                              <div className=' noborder'>
                                <p className="text-lg text-orange-500 noborder">Department</p>
                                <p className="font-medium noborder">{selectedApplication.department || 'Not specified'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50/80">
                              <Calendar className="w-5 h-5 text-gray-500 noborder" />
                              <div className=' noborder'>
                                <p className="text-lg text-orange-500 noborder">Application Date</p>
                                <p className="font-medium noborder">
                                  {new Date(selectedApplication.application_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50/80">
                              <MapPin className="w-5 h-5 text-gray-500 noborder" />
                              <div className=' noborder'>
                                <p className="text-lg text-orange-500 noborder">Location</p>
                                <p className="font-medium noborder">{selectedApplication.job_location || 'Not specified'}</p>
                              </div>
                            </div>
                            
                          </div>
                            {selectedApplication.additional_info && (
                              <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50/80">
                                <Info className="w-5 h-5 text-gray-500 noborder" />
                                <div>
                                  <p className="text-sm text-gray-500 noborder p-3 bg-orange-200 rounded-lg">Additional Info</p>
                                  <p className="font-medium noborder p-3">{selectedApplication.additional_info}</p>
                                </div>
                              </div>
                            )}
                          <div>

                          </div>
                          <div className="mb-8 noborder bg-orange-100">
                            <h3 className="text-lg font-semibold mb-2 noborder p-3 bg-orange-200 rounded-lg">Job Description</h3>
                            <p className="text-gray-700 noborder p-3">{selectedApplication.job_description}</p>
                          </div>

                          <div className="space-y-6 noborder bg-orange-100">
                            <h3 className="text-lg font-semibold noborder p-3 bg-orange-200 rounded-lg">Assessment Overview</h3>
                            <div className="grid sm:grid-cols-2 p-3 gap-4 noborder">
                              {selectedApplication.psy_questions && selectedApplication.psy_questions.length > 0 && (
                                <Card>
                                  <CardContent className="p-4 noborder">
                                    <div className="flex items-center gap-3 noborder">
                                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center noborder">
                                        <Brain className="w-4 h-4 text-violet-600 noborder" />
                                      </div>
                                      <div className=' noborder'>
                                        <p className="font-medium noborder">Psychometric Assessment</p>
                                        {/* <p className="text-sm text-gray-500">Assessment</p> */}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {selectedApplication.case_study_questions && selectedApplication.case_study_questions.length > 0 && (
                                <Card>
                                  <CardContent className="p-4 noborder">
                                    <div className="flex items-center gap-3 noborder">
                                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center noborder">
                                        <FileText className="w-4 h-4 text-emerald-600 noborder" />
                                      </div>
                                      <div className=' noborder'>
                                        <p className="font-medium noborder">Case Study Assessment</p>
                                        {/* <p className="text-sm text-gray-500">Assessment</p> */}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}

                              {/*Group Discussion removed as per instructions*/}

                            </div>

                            {getZoomLink(selectedApplication) && (
                              <div className="mt-6 noborder">
                                <Card className="border-dashed bg-blue-50/50">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between noborder">
                                      <div className="flex items-center gap-3 noborder">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center noborder">
                                          <Video className="w-4 h-4 text-blue-600 noborder" />
                                        </div>
                                        <div className=' noborder'>
                                          <p className="font-medium noborder">Group Discussion Session</p>
                                          <p className="text-sm text-gray-500 noborder">Join via Zoom</p>
                                        </div>
                                      </div>
                                      <Button 
                                        variant="default"
                                        className=" noborder"
                                        onClick={() => window.open(getZoomLink(selectedApplication), '_blank')}
                                      >
                                        Join Meeting
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}

                            {getMBTILink(selectedApplication) && (
                              <div className="mt-6 noborder">
                                <Card className="border-dashed bg-purple-50/50">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between noborder">
                                      <div className="flex items-center gap-3 noborder">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center noborder">
                                          <ExternalLink className="w-4 h-4 text-purple-600 noborder" />
                                        </div>
                                        <div className=' noborder'>
                                          <p className="font-medium noborder">MBTI Assessment</p>
                                          <p className="text-sm text-gray-500 noborder">Take the MBTI test</p>
                                        </div>
                                      </div>
                                      <Button 
                                        variant="default"
                                        className=" noborder"
                                        onClick={() => window.open(getMBTILink(selectedApplication), '_blank')}
                                      >
                                        Start MBTI Test
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              ) : (
                <Card className="text-center py-12 noborder">
                  <CardContent>
                    <Briefcase className="mx-auto h-12 w-12 text-gray-400 noborder" />
                    <h3 className="mt-2 text-lg font-semibold text-gray-900 noborder">No applications yet</h3>
                    <p className="mt-1 text-gray-500 noborder">You haven't been invited to any promote jobs yet.</p>
                    <div className="mt-6 noborder">
                      <Button onClick={() => navigate('/job-search')}>
                        Search for Jobs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ApplicationsPage;

