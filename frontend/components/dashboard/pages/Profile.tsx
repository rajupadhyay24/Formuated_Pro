"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Save, X, Mail, Phone, Calendar, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Profile = () => {
  const { user } = useAuth();
  const userId = user?.id; // replace with your logged-in userId
  const [formData, setFormData] = useState<any>({});
  const [originalData, setOriginalData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`);
        const data = await res.json();
        setFormData(data);
        setOriginalData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  // ✅ Save updated data
  const handleSave = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      setFormData(updated);
      setOriginalData(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  // ✅ Cancel editing (reset to original data)
  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  if (loading) return <div className="text-white p-6">Loading profile...</div>;

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-accent hover:bg-accent/80"
          >
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" /> Save
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="text-white border-gray-500"
            >
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <Card className="bg-zinc-900 border-gray-700">
          <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="bg-accent text-xl">
                {formData.candidateName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold mb-2">
              {formData.candidateName}
            </h3>
            <p className="text-gray-400 mb-4">{formData.emailId}</p>
            <Button variant="outline" className="text-white border-gray-600">
              Change Photo
            </Button>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card className="lg:col-span-2 bg-zinc-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField
                label="Candidate Name"
                icon={<User />}
                field="candidateName"
                value={formData.candidateName}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Father's Name"
                field="fatherName"
                value={formData.fatherName}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Mother's Name"
                field="motherName"
                value={formData.motherName}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Gender"
                field="gender"
                value={formData.gender}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Date of Birth"
                field="dob"
                value={formData.dob}
                type="date"
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Email ID"
                icon={<Mail />}
                field="emailId"
                value={formData.emailId}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Mobile Number"
                icon={<Phone />}
                field="mobileNumber"
                value={formData.mobileNumber}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Education Board"
                field="educationBoard"
                value={formData.educationBoard}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Qualification"
                field="highestQualification"
                value={formData.highestQualification}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Year of Passing"
                field="yearOfPassing"
                value={formData.yearOfPassing}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Roll Number"
                field="rollNumber"
                value={formData.rollNumber}
                isEditing={isEditing}
                setFormData={setFormData}
              />
              <EditableField
                label="Aadhaar Number"
                field="aadharNumber"
                value={formData.aadharNumber}
                isEditing={isEditing}
                setFormData={setFormData}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ✅ Reusable editable input component
const EditableField = ({
  label,
  field,
  value,
  icon,
  type = "text",
  isEditing,
  setFormData,
}: any) => (
  <div className="space-y-2">
    <Label className="text-gray-400">{label}</Label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-3 text-gray-400">{icon}</span>
      )}
      <Input
        type={type}
        value={value || ""}
        onChange={(e) =>
          setFormData((prev: any) => ({ ...prev, [field]: e.target.value }))
        }
        readOnly={!isEditing}
        className={`pl-${icon ? "10" : "3"} bg-zinc-800 border-gray-700 text-white ${isEditing ? "border-blue-500 focus:ring-1 focus:ring-blue-500" : ""}`}
      />
    </div>
  </div>
);
