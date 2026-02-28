"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Application {
  _id: string;
  formType: string;
  status: string;
  submittedAt: string;
  formData: Record<string, any>;
}

const MyApplications: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchApplications = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(
        `process.env.NEXT_PUBLIC_API_URL/api/application/user/${user.id}`,
      );
      const data: Application[] = await res.json();
      setApplications(data || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user?.id]);

  const downloadPDF = (app: Application) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Application Details", 14, 20);

    doc.setFontSize(12);
    doc.text(`Form Type: ${app.formType}`, 14, 30);
    doc.text(`Status: ${app.status}`, 14, 38);
    doc.text(
      `Submitted At: ${new Date(app.submittedAt).toLocaleString()}`,
      14,
      46,
    );

    doc.line(14, 50, 195, 50);

    const rows = Object.entries(app.formData || {}).map(([key, value]) => [
      key.replace(/([A-Z])/g, " $1"),
      String(value),
    ]);

    autoTable(doc, {
      startY: 55,
      head: [["Field", "Value"]],
      body: rows.length > 0 ? rows : [["No Data", ""]],
      styles: { halign: "left" },
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      theme: "striped",
    });

    doc.save(`Application_${app._id}.pdf`);
  };

  if (loading)
    return (
      <p className="text-center mt-6 text-lg text-gray-300">
        Loading applications...
      </p>
    );

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen text-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-white">
        My Applications
      </h1>

      {applications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <Card
              key={app._id}
              className="bg-gradient-to-br from-gray-800 to-gray-700 text-white border border-gray-600 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300 rounded-2xl"
            >
              <CardHeader className="border-b border-gray-600 pb-3">
                <CardTitle className="text-xl font-semibold">
                  {app.formType}
                </CardTitle>
                <p className="text-sm text-gray-300">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      app.status === "Pending"
                        ? "text-yellow-400"
                        : app.status === "Rejected"
                          ? "text-red-400"
                          : "text-green-400"
                    }`}
                  >
                    {app.status}
                  </span>
                </p>
                <p className="text-sm text-gray-400">
                  Submitted: {new Date(app.submittedAt).toLocaleString()}
                </p>
              </CardHeader>

              <CardContent className="mt-3 text-sm space-y-2">
                {app.formData ? (
                  Object.entries(app.formData).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between border-b border-gray-700 pb-1"
                    >
                      <span className="font-medium capitalize text-gray-300">
                        {key.replace(/([A-Z])/g, " $1")}:
                      </span>
                      <span className="text-gray-100">{String(value)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No form data available.</p>
                )}

                <div className="pt-3">
                  <Button
                    onClick={() => downloadPDF(app)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-all"
                  >
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">
          No filled applications found.
        </p>
      )}
    </div>
  );
};

export default MyApplications;
