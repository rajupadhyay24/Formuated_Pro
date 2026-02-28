"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const initialFormData = {
  hasAadhaar: "true",
  aadharNumber: "",
  candidateName: "",
  hasChangedName: "false",
  changedName: "",
  gender: "",
  dob: "",
  fatherName: "",
  motherName: "",
  educationBoard: "",
  rollNumber: "",
  yearOfPassing: "",
  highestQualification: "",
  mobileNumber: "",
  emailId: "",
  password: "",
  // --- CHANGE 1: Added confirmPassword field ---
  confirmPassword: "",
};

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleRadioChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- CHANGE 2: Added password confirmation check ---
    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "process.env.NEXT_PUBLIC_API_URL/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      setSuccess("Registration successful! Please login.");
      setTimeout(() => {
        setFormData(initialFormData);
        onSwitchToLogin();
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            One Time Registration
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-2 md:p-4">
          {error && (
            <div className="p-3 text-center rounded-lg bg-red-100 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 text-center rounded-lg bg-green-100 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          <h3 className="font-bold text-lg border-b pb-2">
            1. Personal Details
          </h3>

          <div className="space-y-2">
            <Label>Do you have a Aadhaar Card? *</Label>
            <RadioGroup
              value={formData.hasAadhaar}
              onValueChange={(val: string) =>
                handleRadioChange("hasAadhaar", val)
              }
              className="flex gap-4 py-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="aadhaarYes" />
                <Label htmlFor="aadhaarYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="aadhaarNo" />
                <Label htmlFor="aadhaarNo">No</Label>
              </div>
            </RadioGroup>
          </div>
          {formData.hasAadhaar === "true" && (
            <InputWithLabel
              id="aadharNumber"
              label="Aadhaar Details (UID / VID) *"
              value={formData.aadharNumber}
              onChange={handleChange}
            />
          )}

          <InputWithLabel
            id="candidateName"
            label="Candidate Name (As per Matriculation Certificate) *"
            value={formData.candidateName}
            onChange={handleChange}
          />

          <div className="space-y-2">
            <Label>Have you ever changed Name? *</Label>
            <RadioGroup
              value={formData.hasChangedName}
              onValueChange={(val: string) =>
                handleRadioChange("hasChangedName", val)
              }
              className="flex gap-4 py-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="changedNameYes" />
                <Label htmlFor="changedNameYes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="changedNameNo" />
                <Label htmlFor="changedNameNo">No</Label>
              </div>
            </RadioGroup>
          </div>
          {formData.hasChangedName === "true" && (
            <InputWithLabel
              id="changedName"
              label="New Name / Changed Name *"
              value={formData.changedName}
              onChange={handleChange}
            />
          )}

          <SelectWithLabel
            id="gender"
            label="Gender *"
            value={formData.gender}
            onValueChange={(val: string) => handleSelectChange("gender", val)}
            options={["Male", "Female", "Other"]}
          />
          <InputWithLabel
            id="dob"
            label="Date Of Birth (DD-MM-YYYY) *"
            type="date"
            value={formData.dob}
            onChange={handleChange}
          />
          <InputWithLabel
            id="fatherName"
            label="Father's Name *"
            value={formData.fatherName}
            onChange={handleChange}
          />
          <InputWithLabel
            id="motherName"
            label="Mother's Name *"
            value={formData.motherName}
            onChange={handleChange}
          />

          <h3 className="font-bold text-lg border-b pb-2 pt-4">
            2. Education & Contact Details
          </h3>

          <SelectWithLabel
            id="educationBoard"
            label="Matriculation (10th class) Education Board *"
            value={formData.educationBoard}
            onValueChange={(val: string) =>
              handleSelectChange("educationBoard", val)
            }
            options={["CBSE", "ICSE", "State Board", "Other"]}
          />
          <InputWithLabel
            id="rollNumber"
            label="Roll Number *"
            value={formData.rollNumber}
            onChange={handleChange}
          />
          <SelectWithLabel
            id="yearOfPassing"
            label="Year of Passing *"
            value={formData.yearOfPassing}
            onValueChange={(val: string) =>
              handleSelectChange("yearOfPassing", val)
            }
            options={["2022", "2021", "2020", "2019-2014"]}
          />
          <SelectWithLabel
            id="highestQualification"
            label="Highest Level of Education Qualification *"
            value={formData.highestQualification}
            onValueChange={(val: string) =>
              handleSelectChange("highestQualification", val)
            }
            options={[
              "Matriculation (10th)",
              "Higher Secondary (10+2)",
              "Diploma",
              "Graduation",
              "Post Graduation",
            ]}
          />

          <InputWithLabel
            id="mobileNumber"
            label="Candidate's Mobile Number *"
            type="tel"
            value={formData.mobileNumber}
            onChange={handleChange}
          />
          <InputWithLabel
            id="emailId"
            label="Candidate's Email ID *"
            type="email"
            value={formData.emailId}
            onChange={handleChange}
          />
          <InputWithLabel
            id="password"
            label="Password *"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* --- CHANGE 3: Added Confirm Password input field --- */}
          <InputWithLabel
            id="confirmPassword"
            label="Confirm Password *"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save & Next"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Helper Components (No changes here)
const InputWithLabel = ({ id, label, ...props }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
    <Label htmlFor={id} className="md:text-right">
      {label}
    </Label>
    <Input id={id} className="col-span-2" {...props} required />
  </div>
);
const SelectWithLabel = ({
  id,
  label,
  onValueChange,
  options,
  ...props
}: any) => (
  <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
    <Label htmlFor={id} className="md:text-right">
      {label}
    </Label>
    <Select onValueChange={onValueChange} {...props}>
      <SelectTrigger id={id} className="col-span-2">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt: string) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
