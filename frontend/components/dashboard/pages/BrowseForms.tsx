"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const BrowseForms: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingForm, setLoadingForm] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const { user } = useAuth();

  
  const forms = [
    {
      id: 1,
      name: "SSC OTR",
      category: "SSC",
      description:
        "Application form for Combined Graduate Level Examination conducted by SSC",
      difficulty: "Medium",
      estimatedTime: "30 min",
      popular: true,
      route: "/start-ssc-automation",
    },
    {
      id: 2,
      name: "UPSC Civil Services Examination Form",
      category: "UPSC",
      description:
        "Application form for IAS, IPS, IFS and other civil services exams",
      difficulty: "Hard",
      estimatedTime: "45 min",
      popular: true,
      route: "/start-upsc-automation",
    },
    {
      id: 3,
      name: "Railway RRB NTPC Application Form",
      category: "Railway",
      description:
        "Apply for Non-Technical Popular Categories recruitment in Indian Railways",
      difficulty: "Medium",
      estimatedTime: "25 min",
      popular: false,
      route: "/start-railway-automation",
    },
    {
      id: 4,
      name: "State Government PSC Application Form",
      category: "State Govt.",
      description: "Application form for state public service commission exams",
      difficulty: "Medium",
      estimatedTime: "30 min",
      popular: false,
      route: "/start-statepsc-automation",
    },
    {
      id: 5,
      name: "IBPS PO/Clerk Application Form",
      category: "Banking",
      description:
        "Form to apply for Probationary Officer or Clerk posts in public sector banks",
      difficulty: "Medium",
      estimatedTime: "20 min",
      popular: true,
      route: "/start-banking-automation",
    },
    {
      id: 6,
      name: "SSC CHSL Application Form",
      category: "SSC",
      description:
        "Application form for Combined Higher Secondary Level Examination",
      difficulty: "Easy",
      estimatedTime: "20 min",
      popular: true,
      route: "/start-ssc-automation",
    },
  ];

  const filteredForms = forms.filter(
    (form) =>
      form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.category.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleAutomationClick = async (route: string, formId: number) => {
    try {
      setLoadingForm(formId);
      setFeedback("Starting automation... A new browser window should open shortly.");

      const response = await fetch(`http://localhost:5000${route}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user?.id }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Automation failed.");

      setFeedback(`✅ Success: ${data.message}`);
    } catch (err: any) {
      console.error("Automation Error:", err);
      setFeedback(
        `❌ Error: ${
          err.message || "Failed to run automation. Please check backend logs."
        }`
      );
    } finally {
      setLoadingForm(null);
    }
  };


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };


  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
     
      <div>
        <h1 className="text-3xl font-bold text-foreground">Browse Forms</h1>
        <p className="text-muted-foreground">
          Click a button to start the automated process.
        </p>
      </div>

     
      {feedback && (
        <div
          className={`p-4 rounded-md text-sm ${
            feedback.includes("Error")
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {feedback}
        </div>
      )}

     
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search forms by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-input border-border text-foreground"
        />
      </div>

    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <Card
            key={form.id}
            className="bg-card border-border hover:border-accent/50 transition-all duration-300 flex flex-col"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground line-clamp-2">
                    {form.name}
                  </CardTitle>
                  {form.popular && (
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-accent mr-1" />
                      <span className="text-sm text-accent">Popular</span>
                    </div>
                  )}
                </div>
                <FileText className="h-6 w-6 text-accent flex-shrink-0" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex flex-col flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {form.description}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="bg-secondary/20 text-secondary-foreground"
                >
                  {form.category}
                </Badge>
                <Badge className={getDifficultyColor(form.difficulty)}>
                  {form.difficulty}
                </Badge>
              </div>

              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                {form.estimatedTime}
              </div>

              <div className="flex-grow" />

              {form.route && (
                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground mt-auto"
                  onClick={() => handleAutomationClick(form.route, form.id)}
                  disabled={loadingForm === form.id}
                >
                  {loadingForm === form.id ? "Processing..." : "Fill Form"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BrowseForms;
