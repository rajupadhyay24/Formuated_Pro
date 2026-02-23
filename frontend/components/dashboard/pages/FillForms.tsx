"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, CheckCircle, FileText, Zap } from "lucide-react"

export const FillForms: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [isAutoFilling, setIsAutoFilling] = useState(false)
  const [progress, setProgress] = useState(0)

  const availableForms = [
    {
      id: 1,
      name: "Form 1040 - Tax Return",
      status: "ready",
      fields: 45,
      completedFields: 0,
    },
    {
      id: 2,
      name: "Passport Application",
      status: "in-progress",
      fields: 25,
      completedFields: 18,
    },
    {
      id: 3,
      name: "Business License",
      status: "completed",
      fields: 30,
      completedFields: 30,
    },
  ]

  const startAutoFill = () => {
    setIsAutoFilling(true)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsAutoFilling(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Fill Forms</h1>
        <p className="text-muted-foreground">Automatically fill your selected forms with one click</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
       
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Available Forms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableForms.map((form) => (
              <div
                key={form.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedForm?.id === form.id
                    ? "border-accent bg-accent/10"
                    : "border-border bg-muted/20 hover:border-accent/50"
                }`}
                onClick={() => setSelectedForm(form)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{form.name}</h4>
                  <Badge className={getStatusColor(form.status)}>{form.status.replace("-", " ")}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {form.completedFields}/{form.fields} fields completed
                  </span>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {Math.round((form.completedFields / form.fields) * 100)}%
                  </div>
                </div>
                <Progress value={(form.completedFields / form.fields) * 100} className="mt-2 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

     
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Auto-Fill Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedForm ? (
              <>
                <div className="text-center">
                  <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-10 w-10 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{selectedForm.name}</h3>
                  <p className="text-muted-foreground">Ready for automatic filling</p>
                </div>

                {isAutoFilling && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">Auto-filling progress</span>
                      <span className="text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>
                )}

                <div className="flex flex-col space-y-3">
                  {!isAutoFilling ? (
                    <Button
                      onClick={startAutoFill}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      disabled={selectedForm.status === "completed"}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {selectedForm.status === "completed" ? "Form Completed" : "Start Auto-Fill"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setIsAutoFilling(false)}
                      variant="outline"
                      className="border-border text-foreground"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Auto-Fill
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="border-border text-foreground bg-transparent"
                    onClick={() => setProgress(0)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Form
                  </Button>
                </div>

                {progress === 100 && (
                  <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-800 dark:text-green-200 font-medium">Form filled successfully!</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Form</h3>
                <p className="text-muted-foreground">Choose a form from the list to start auto-filling</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
