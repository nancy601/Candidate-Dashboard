import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EducationCard from '../components/EducationCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../atoms/Button';
import { GraduationCap, BookOpen, Award, Clock } from 'lucide-react';

const EducationPage = () => {
  const navigate = useNavigate();
  const [education, setEducation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/profile/${companyName}/${employeeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch education data');
      }
      const data = await response.json();
      setEducation(data.education || {});
    } catch (err) {
      setError(err.message);
      console.error('Error fetching education:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEducationUpdate = async (educationData) => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/profile/${companyName}/${employeeId}/education`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(educationData),
      });

      if (!response.ok) {
        throw new Error('Failed to update education data');
      }

      const updatedData = await response.json();
      setEducation(updatedData.education);
    } catch (err) {
      console.error('Error updating education:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={fetchEducation} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
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
            <div className="max-w-4xl mx-auto noborder">
              <h1 className="text-3xl font-bold text-gray-900 mb-6 noborder flex items-center">
                <GraduationCap className="mr-2 h-8 w-8 text-orange-500" />
                Education Details
              </h1>
              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-orange-500" />
                      Academic Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Your academic journey is a crucial part of your professional profile. Keep this section up-to-date to showcase your educational achievements.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="mr-2 h-5 w-5 text-orange-500" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Don't forget to add any relevant certifications or additional qualifications you've earned. These can set you apart in your career.
                    </p>
                  </CardContent>
                </Card>
              </div> */}
              <EducationCard education={education} onUpdate={handleEducationUpdate} />
              {/* <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-orange-500" />
                      Education Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative border-l-2 border-orange-200 pl-4 ml-2">
                      {education && Object.entries(education).map(([level, details]) => (
                        <div key={level} className="mb-4 relative">
                          <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[1.4rem] top-1.5"></div>
                          <h3 className="text-lg font-semibold text-gray-900">{level}</h3>
                          <p className="text-sm text-gray-600">{details.yearOfPassing}</p>
                          <p className="text-sm text-gray-700">{details.school || details.collegeName}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div> */}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default EducationPage;

