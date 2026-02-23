"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { DashboardContent } from "./DashboardContent"
import { UploadDocuments } from "./pages/UploadDocuments"
import { BrowseForms } from "./pages/BrowseForms"
import { FillForms } from "./pages/FillForms"
import  MyApplications from "./pages/MyApplications"
import { Profile } from "./pages/Profile"
import PremiumFeatures  from "./pages/PremiumFeatures"

export const DashboardLayout: React.FC = () => {
  const [activeSection, setActiveSection] = useState("dashboard")

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />
      case "upload":
        return <UploadDocuments />
      case "browse":
        return <BrowseForms />
      case "fill":
        return <FillForms />
      case "applications":
        return <MyApplications />
      case "profile":
        return <Profile />
      case "premium":
        return <PremiumFeatures />
      default:
        return <DashboardContent />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className="flex-1 overflow-y-auto">{renderContent()}</main>
    </div>
  )
}
