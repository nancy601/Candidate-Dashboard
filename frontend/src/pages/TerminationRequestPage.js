import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
// import { Textarea } from '../atoms/Textarea';
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { AlertCircle, Loader2, Info, Calendar, Clock, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const TerminationRequestPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reason, setReason] = useState('');
  const [lastWorkingDate, setLastWorkingDate] = useState('');
  const [existingRequest, setExistingRequest] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [reasonCategory, setReasonCategory] = useState('');
  const [noticePeriod, setNoticePeriod] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');

  useEffect(() => {
    fetchExistingRequest();
  }, []);

  const fetchExistingRequest = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/termination-request/${companyName}/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setExistingRequest(data);
      }
    } catch (err) {
      console.error('Error fetching termination request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const confirmSubmission = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5000/api/termination-request/${companyName}/${employeeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          reason,
          reasonCategory,
          lastWorkingDate,
          noticePeriod,
          handoverNotes
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExistingRequest(data);
        setShowConfirmDialog(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (err) {
      setError('An error occurred while submitting the request.');
      console.error('Error submitting termination request:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const calculateMinLastWorkingDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 30); // Minimum 30 days notice period
    return today.toISOString().split('T')[0];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen noborder">
        <Loader2 className="w-8 h-8 animate-spin text-primary noborder" />
        <p className="mt-4 text-gray-600 noborder">Loading...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen noborder">
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="p-6 bg-gray-50/50 noborder">
            <div className="max-w-3xl mx-auto noborder">
              <div className="mb-6 noborder">
                <h1 className="text-2xl font-bold text-gray-900 noborder">Termination Request</h1>
                <p className="mt-2 text-gray-600 noborder">Submit your request for employment termination. Please review the company policy before proceeding.</p>
              </div>

              {/* Policy Information Card */}
              <Card className="mb-6 border-orange-200 bg-orange-50">
                <CardContent className="p-4 noborder">
                  <div className="flex items-start space-x-3 noborder">
                    <Info className="w-5 h-5 text-orange-500 mt-0.5 noborder" />
                    <div className=' noborder'>
                      <h3 className="font-medium text-gray-900 noborder">Important Policy Information</h3>
                      <ul className="mt-2 space-y-2 text-sm text-gray-600 noborder">
                        <li className=' noborder'>• Minimum notice period is 30 days from the date of submission</li>
                        <li className=' noborder'>• All company assets must be returned before the last working day</li>
                        <li className=' noborder'>• Complete handover documentation is mandatory</li>
                        <li className=' noborder'>• Final settlement will be processed within 45 days of last working day</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 noborder" role="alert">
                  <strong className="font-bold noborder">Error: </strong>
                  <span className="block sm:inline noborder">{error}</span>
                </div>
              )}

              {existingRequest ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Existing Termination Request</CardTitle>
                    <CardDescription>Your termination request details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 noborder">
                    <div className="grid gap-4 noborder">
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1 noborder">Status</p>
                        <p className="font-medium text-gray-900 noborder">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium noborder
                            ${existingRequest.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' : 
                              existingRequest.status === 'Approved' ? 'bg-green-200 text-green-800' : 
                              'bg-red-200 text-red-800'}`}>
                            {existingRequest.status || 'Not specified'}
                          </span>
                        </p>
                      </div>
                      
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1 noborder">Category</p>
                        <p className="font-medium text-gray-900 noborder">{existingRequest.reason_category || 'Not specified'}</p>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1 noborder">Reason</p>
                        <p className="font-medium text-gray-900 noborder">{existingRequest.reason || 'Not specified'}</p>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1 noborder">Last Working Date</p>
                        <p className="font-medium text-gray-900 noborder">{formatDate(existingRequest.last_working_date)}</p>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1 noborder">Notice Period</p>
                        <p className="font-medium text-gray-900 noborder">{existingRequest.notice_period || 'Standard (30 days)'}</p>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1 noborder">Request Date</p>
                        <p className="font-medium text-gray-900 noborder">{formatDate(existingRequest.request_date)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Termination Request</CardTitle>
                    <CardDescription>Please fill in all required information carefully</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6 noborder">
                      <div className="space-y-4 noborder">
                        <div className=' noborder'>
                          <label className="block text-sm font-medium text-gray-700 noborder">Reason Category</label>
                          <Select 
                            value={reasonCategory} 
                            onValueChange={setReasonCategory}
                            required
                          >
                            <SelectTrigger className="w-full mt-1">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="better-opportunity">Better Opportunity</SelectItem>
                              <SelectItem value="personal">Personal Reasons</SelectItem>
                              <SelectItem value="relocation">Relocation</SelectItem>
                              <SelectItem value="health">Health Issues</SelectItem>
                              <SelectItem value="work-environment">Work Environment</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className=' noborder'>
                          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 noborder">
                            Detailed Reason
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <Input
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            className="mt-1 block w-full"
                            rows={4}
                            placeholder="Please provide a detailed explanation for your decision to leave"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 noborder">
                          <div className=' noborder'>
                            <label htmlFor="lastWorkingDate" className="block text-sm font-medium text-gray-700 noborder">
                              Last Working Date
                              <span className="text-red-500 ml-1 noborder">*</span>
                            </label>
                            <div className="mt-1 relative noborder">
                              <Input
                                type="date"
                                id="lastWorkingDate"
                                value={lastWorkingDate}
                                onChange={(e) => setLastWorkingDate(e.target.value)}
                                required
                                min={calculateMinLastWorkingDate()}
                                className="pl-10"
                              />
                              <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 noborder" />
                            </div>
                          </div>

                          <div className=' noborder'>
                            <label className="block text-sm font-medium text-gray-700 noborder">Notice Period</label>
                            <Select 
                              value={noticePeriod} 
                              onValueChange={setNoticePeriod}
                            >
                              <SelectTrigger className="w-full mt-1">
                                <SelectValue placeholder="Standard (30 days)" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">Standard (30 days)</SelectItem>
                                <SelectItem value="45">45 days</SelectItem>
                                <SelectItem value="60">60 days</SelectItem>
                                <SelectItem value="90">90 days</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className=' noborder'>
                          <label htmlFor="handover" className="block text-sm font-medium text-gray-700 noborder">
                            Handover Notes
                            <span className="text-red-500 ml-1 noborder">*</span>
                          </label>
                          <Input
                            id="handover"
                            value={handoverNotes}
                            onChange={(e) => setHandoverNotes(e.target.value)}
                            required
                            className="mt-1 block w-full"
                            rows={4}
                            placeholder="Please provide details about your current responsibilities and handover plan"
                          />
                        </div>
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <div className="flex noborder">
                          <div className="flex-shrink-0 noborder">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 noborder" />
                          </div>
                          <div className="ml-3 noborder">
                            <p className="text-sm text-yellow-700 noborder">
                              By submitting this request, you acknowledge that this action cannot be reversed once approved.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white noborder"
                      >
                        {isLoading ? 'Submitting...' : 'Submit Termination Request'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </SidebarInset>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Termination Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your termination request? This action cannot be undone once approved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 noborder">
            <div className="grid grid-cols-2 gap-4 text-sm noborder">
              <div className=' noborder p-2 bg-orange-200 rounded-lg'>
                <p className="font-bold text-gray-900 noborder">Last Working Date</p>
                <p className="font-medium noborder">{formatDate(lastWorkingDate)}</p>
              </div>
              <div className=' noborder p-2 bg-orange-200 rounded-lg'>
                <p className="font-bold text-gray-900 noborder">Notice Period</p>
                <p className="font-medium noborder">{noticePeriod || 'Standard (30 days)'}</p>
              </div>
            </div>
            <div className=' noborder p-2 bg-orange-200 rounded-lg'>
              <p className="font-bold text-gray-900 noborder">Reason Category</p>
              <p className="font-medium noborder">{reasonCategory}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white noborder"
              onClick={confirmSubmission}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Confirm Submission'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default TerminationRequestPage;

