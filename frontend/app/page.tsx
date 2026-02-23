"use client"

import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  )
}
