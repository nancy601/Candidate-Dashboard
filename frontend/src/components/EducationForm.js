import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

const EducationForm = ({ onSubmit, initialData = {} }) => {
  const [formData, setFormData] = useState({
    // X details
    xSchool: initialData.xSchool || '',
    xBoard: initialData.xBoard || '',
    xPercentage: initialData.xPercentage || '',
    xYearOfPassing: initialData.xYearOfPassing || '',
    
    // XII details
    xiiSchool: initialData.xiiSchool || '',
    xiiBoard: initialData.xiiBoard || '',
    xiiPercentage: initialData.xiiPercentage || '',
    xiiYearOfPassing: initialData.xiiYearOfPassing || '',
    
    // College details
    collegeName: initialData.collegeName || '',
    degree: initialData.degree || '',
    major: initialData.major || '',
    collegePercentage: initialData.collegePercentage || '',
    collegeYearOfPassing: initialData.collegeYearOfPassing || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields are filled
    const requiredFields = Object.keys(formData);
    const emptyFields = requiredFields.filter(field => !formData[field]);
    
    if (emptyFields.length > 0) {
      alert('Please fill all the fields');
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border-none px-6">
      {/* Class X Details */}
      <div className="space-y-4 p-4 bg-orange-50 rounded-lg noborder">
        <h3 className="font-semibold text-lg noborder">Class X Details</h3>
        <div className="space-y-2 noborder">
          <Label>School Name</Label>
          <Input
            name="xSchool"
            value={formData.xSchool}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2 noborder">
          <Label>Board</Label>
          <Input
            name="xBoard"
            value={formData.xBoard}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4 noborder">
          <div className="space-y-2 noborder">
            <Label>Percentage</Label>
            <Input
              name="xPercentage"
              type="number"
              value={formData.xPercentage}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2 noborder">
            <Label>Year of Passing</Label>
            <Input
              name="xYearOfPassing"
              type="number"
              value={formData.xYearOfPassing}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* Class XII Details */}
      <div className="space-y-4 p-4 bg-orange-50 rounded-lg noborder">
        <h3 className="font-semibold text-lg noborder">Class XII Details</h3>
        <div className="space-y-2 noborder">
          <Label>School Name</Label>
          <Input
            name="xiiSchool"
            value={formData.xiiSchool}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2 noborder">
          <Label>Board</Label>
          <Input
            name="xiiBoard"
            value={formData.xiiBoard}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4 noborder">
          <div className="space-y-2 noborder">
            <Label>Percentage</Label>
            <Input
              name="xiiPercentage"
              type="number"
              value={formData.xiiPercentage}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2 noborder">
            <Label>Year of Passing</Label>
            <Input
              name="xiiYearOfPassing"
              type="number"
              value={formData.xiiYearOfPassing}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      {/* College Details */}
      <div className="space-y-4 p-4 bg-orange-50 rounded-lg noborder">
        <h3 className="font-semibold text-lg noborder">College Details</h3>
        <div className="space-y-2 noborder">
          <Label>College Name</Label>
          <Input
            name="collegeName"
            value={formData.collegeName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2 noborder">
          <Label>Degree</Label>
          <Input
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2 noborder">
          <Label>Major</Label>
          <Input
            name="major"
            value={formData.major}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4 noborder">
          <div className="space-y-2 noborder">
            <Label>Percentage</Label>
            <Input
              name="collegePercentage"
              type="number"
              value={formData.collegePercentage}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2 noborder">
            <Label>Year of Passing</Label>
            <Input
              name="collegeYearOfPassing"
              type="number"
              value={formData.collegeYearOfPassing}
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full noborder">
        {initialData ? 'Update' : 'Add'} Education
      </Button>
    </form>
  );
};

export default EducationForm;

