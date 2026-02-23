"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { FileText, Clock, CheckCircle, AlertCircle, TrendingUp, Plus, ArrowRight, Upload } from "lucide-react"

export const DashboardContent: React.FC = () => {
  const stats = [
    {
      title: "Total Applications",
      value: "24",
      change: "+12%",
      icon: FileText,
      color: "text-chart-1",
    },
    {
      title: "Completed",
      value: "18",
      change: "+8%",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      title: "In Progress",
      value: "4",
      change: "+2",
      icon: Clock,
      color: "text-chart-2",
    },
    {
      title: "Pending Review",
      value: "2",
      change: "-1",
      icon: AlertCircle,
      color: "text-yellow-500",
    },
  ]

  const recentForms = [
    {
      name: "Government Job Form - UPSC",
      status: "Completed",
      date: "2024-09-15",
      progress: 100,
    },
    {
      name: "Railway Recruitment Form",
      status: "In Progress",
      date: "2024-09-14",
      progress: 75,
    },
    {
      name: "SSC Exam Form",
      status: "Pending Review",
      date: "2024-09-13",
      progress: 90,
    },
    {
      name: "State Police Form",
      status: "In Progress",
      date: "2024-09-12",
      progress: 45,
    },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
    
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your government job applications.
          </p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="bg-card border-border hover:border-accent/50 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="flex items-center mt-4">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500 font-medium">{stat.change}</span>
                  <span className="text-sm text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

   
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentForms.map((form, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{form.name}</h4>
                  <p className="text-sm text-muted-foreground">{form.date}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Progress</span>
                      <span className="text-xs text-muted-foreground">{form.progress}%</span>
                    </div>
                    <Progress value={form.progress} className="h-2" />
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      form.status === "Completed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : form.status === "In Progress"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {form.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-between border-border text-foreground hover:bg-accent/10 hover:border-accent bg-transparent"
            >
              <div className="flex items-center">
                <Upload className="h-4 w-4 mr-3" />
                Upload Documents
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between border-border text-foreground hover:bg-accent/10 hover:border-accent bg-transparent"
            >
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-3" />
                Browse Applications
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              className="w-full justify-between border-border text-foreground hover:bg-accent/10 hover:border-accent bg-transparent"
            >
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-3" />
                Fill New Application
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
              <h4 className="font-medium text-foreground mb-2">Upgrade to Premium</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Unlock advanced features and priority support
              </p>
              <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
