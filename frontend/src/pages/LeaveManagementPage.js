import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import { SidebarProvider, SidebarInset } from '../components/ui/sidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const LeaveManagementPage = () => {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({});
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    startDate: '',
    endDate: '',
    leaveType: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
    fetchLeaveBalance();
  }, []);

  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [error]);

  const fetchLeaveRequests = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    if (!employeeId || !companyName) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/leave-requests/${companyName}/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveRequests(data);
      } else {
        console.error('Failed to fetch leave requests');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLeaveBalance = async () => {
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');
    try {
      const response = await fetch(`http://localhost:5000/api/leave-balance/${companyName}/${employeeId}`);
      if (response.ok) {
        const data = await response.json();
        setLeaveBalance(data);
      } else {
        console.error('Failed to fetch leave balance');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleInputChange = (e) => {
    setNewLeaveRequest({
      ...newLeaveRequest,
      [e.target.name]: e.target.value
    });
  };

  const handleLeaveTypeChange = (value) => {
    setNewLeaveRequest({
      ...newLeaveRequest,
      leaveType: value
    });
  };

  const checkOverlappingLeaves = (startDate, endDate) => {
    return leaveRequests.some(request => {
      const requestStart = new Date(request.startDate);
      const requestEnd = new Date(request.endDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      return (
        (newStart >= requestStart && newStart <= requestEnd) ||
        (newEnd >= requestStart && newEnd <= requestEnd) ||
        (newStart <= requestStart && newEnd >= requestEnd)
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const employeeId = localStorage.getItem('employeeId');
    const companyName = localStorage.getItem('companyName');

    // Check for overlapping leave requests
    if (checkOverlappingLeaves(newLeaveRequest.startDate, newLeaveRequest.endDate)) {
      setError('You already have a leave request for this period.');
      setSuccessMessage('');
      return;
    }

    // Check if start date is before end date
    if (new Date(newLeaveRequest.startDate) > new Date(newLeaveRequest.endDate)) {
      setError('Start date cannot be after end date.');
      setSuccessMessage('');
      return;
    }

    // Check if the leave request is for a future date
    if (new Date(newLeaveRequest.startDate) < new Date()) {
      setError('Leave request cannot be for a past date.');
      setSuccessMessage('');
      return;
    }

    // Check if sufficient leave balance is available
    const leaveType = newLeaveRequest.leaveType;
    const requestedDays = Math.ceil((new Date(newLeaveRequest.endDate) - new Date(newLeaveRequest.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    if (leaveBalance[leaveType] && leaveBalance[leaveType].remaining < requestedDays) {
      setError(`Insufficient ${leaveType} leave balance. You have ${leaveBalance[leaveType].remaining} days remaining.`);
      setSuccessMessage('');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/leave-requests/${companyName}/${employeeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLeaveRequest),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Leave request submitted successfully');
        setError('');
        fetchLeaveRequests();
        fetchLeaveBalance();
        setNewLeaveRequest({
          startDate: '',
          endDate: '',
          leaveType: '',
          reason: ''
        });
      } else {
        setError(data.error || 'Failed to submit leave request');
        setSuccessMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again.');
      setSuccessMessage('');
    }
  };

  const LeaveBalanceCard = ({ type, balance }) => (
    <Card className="bg-card hover:bg-accent/5 transition-colors">
      <CardContent className="p-6 noborder">
        <div className="flex items-center justify-between mb-4 noborder">
          <div className="space-y-1 noborder">
            <h3 className="font-semibold capitalize text-lg noborder">{type}</h3>
            <p className="text-sm text-muted-foreground noborder">Leave Balance</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center noborder">
            <Clock className="h-6 w-6 text-primary noborder" />
          </div>
        </div>
        <div className="space-y-2 noborder">
          <div className="flex justify-between items-center noborder bg-orange-50 p-2">
            <span className="text-sm text-muted-foreground noborder">Allocated</span>
            <span className="font-medium noborder">{balance.allocated}</span>
          </div>
          <div className="flex justify-between items-center noborder bg-orange-50 p-2">
            <span className="text-sm text-muted-foreground noborder">Used</span>
            <span className="font-medium noborder">{balance.used}</span>
          </div>
          <div className="flex justify-between items-center noborder bg-orange-50 p-2">
            <span className="text-sm font-medium noborder">Remaining</span>
            <span className="font-bold text-primary noborder">{balance.remaining}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen noborder">
        <Sidebar />
        <SidebarInset>
          <Header />
          <main className="p-6 bg-background noborder">
            <div className="max-w-7xl mx-auto space-y-8 noborder">
              <div className=' noborder'>
                <h1 className="text-3xl font-bold tracking-tight noborder">Leave Management</h1>
                <p className="text-muted-foreground mt-2 noborder">
                  Submit and track your leave requests
                </p>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center noborder">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 noborder" />
                  <p>{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 bg-emerald-500/15 text-emerald-600 px-4 py-3 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 noborder" />
                  <p className="text-sm font-medium noborder">{successMessage}</p>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 noborder">
                {Object.entries(leaveBalance).map(([type, balance]) => (
                  <LeaveBalanceCard key={type} type={type} balance={balance} />
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2 noborder">
                <Card>
                  <CardHeader>
                    <CardTitle>Submit Leave Request</CardTitle>
                    <CardDescription>
                      Fill in the details below to submit a new leave request
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6 noborder">
                      <div className="grid gap-4 md:grid-cols-2 noborder">
                        <div className="space-y-2 noborder">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            name="startDate"
                            type="date"
                            value={newLeaveRequest.startDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2 noborder">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            name="endDate"
                            type="date"
                            value={newLeaveRequest.endDate}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2 noborder">
                        <Label htmlFor="leaveType">Leave Type</Label>
                        <Select
                          value={newLeaveRequest.leaveType}
                          onValueChange={handleLeaveTypeChange}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue className=' noborder' placeholder="Select leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="casual">Casual Leave</SelectItem>
                            <SelectItem value="sick">Sick Leave</SelectItem>
                            <SelectItem value="annual">Annual Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 noborder">
                        <Label htmlFor="reason">Reason</Label>
                        <Input
                          id="reason"
                          name="reason"
                          value={newLeaveRequest.reason}
                          onChange={handleInputChange}
                          required
                          className="min-h-[100px]"
                          placeholder="Please provide a reason for your leave request"
                        />
                      </div>
                      <Button type="submit" className="w-full noborder">
                        Submit Leave Request
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Leave Requests</CardTitle>
                    <CardDescription>
                      View and track your leave request history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {leaveRequests.length > 0 ? (
                      <div className="space-y-4 noborder">
                        {leaveRequests.map((request, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-full bg-orange-300 flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-5 w-5 text-primary noborder" />
                            </div>
                            <div className="flex-1 min-w-0 noborder">
                              <div className="flex items-center justify-between gap-2 noborder">
                                <p className="font-medium capitalize noborder">{request.leaveType} Leave</p>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold noborder ${
                                  request.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                  request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {request.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 noborder">
                                {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1 p-1 truncate noborder">
                                {request.reason}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 noborder">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 noborder" />
                        <h3 className="text-lg font-medium noborder">No leave requests</h3>
                        <p className="text-sm text-muted-foreground mt-1 noborder">
                          You haven't submitted any leave requests yet.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default LeaveManagementPage;

