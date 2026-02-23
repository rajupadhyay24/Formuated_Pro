"use client";

import React, { useState, useRef, DragEvent, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type FileItem = {
  id: string;
  file?: File;
  name: string;
  status: "idle" | "uploading" | "done" | "error";
  response?: any;
  _id?: string;
  imageUrl?: string;
};

export const UploadDocuments: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { user } = useAuth();

 
  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!user?.id) return;
     console.log(user?.id)
      try {
        const res = await fetch(`http://localhost:5000/api/user/${user?.id}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          const mapped = data.map((f: any) => ({
            _id: f._id,
            id: f._id,
            name: f.filename || f.title || "Unnamed file",
            status: "done" as const,
            response: f.importantData, // fix mapping
            imageUrl: `http://localhost:5000/api/marksheets/${f._id}/image`,
          }));

          setFiles((prev) => {
            const existingIds = new Set(prev.map((p) => p._id));
            const newOnes = mapped.filter((m) => !existingIds.has(m._id));
            return [...prev, ...newOnes];
          });
        }
      } catch (err) {
        console.error("Failed to fetch user files:", err);
      }
    };

    fetchUserFiles();
  }, [user]);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const arr = Array.from(fileList).map((f) => ({
      id: `${Date.now()}-${f.name}`,
      file: f,
      name: f.name,
      status: "idle" as const,
    }));
    setFiles((prev) => [...prev, ...arr]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => e.preventDefault();


  const removeFile = async (id: string) => {
    const file = files.find((f) => f.id === id || f._id === id);
    if (!file) return;

    if (file._id) {
      try {
        const res = await fetch(`http://localhost:5000/api/marksheets/${file._id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          console.error("Failed to delete:", await res.text());
          return;
        }
      } catch (err) {
        console.error(err);
        return;
      }
    }

    setFiles((prev) => prev.filter((f) => f.id !== id && f._id !== id));
  };

  const uploadAll = async () => {
    for (let f of files) {
      if (!f.file) continue;

      setFiles((prev) =>
        prev.map((p) => (p.id === f.id ? { ...p, status: "uploading" } : p))
      );

      const fd = new FormData();
      fd.append("file", f.file);
      fd.append("userId", user?.id || "");

      try {
        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();

        if (res.ok) {
          setFiles((prev) =>
            prev.map((p) =>
              p.id === f.id
                ? { ...p, status: "done", response: data.data.response, _id: data.data._id }
                : p
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((p) => (p.id === f.id ? { ...p, status: "error" } : p))
          );
        }
      } catch {
        setFiles((prev) =>
          prev.map((p) => (p.id === f.id ? { ...p, status: "error" } : p))
        );
      }
    }
  };

  const renderValue = (value: any): React.ReactNode => {
    if (Array.isArray(value)) {
      return (
        <table className="border-collapse border w-full my-2">
          <tbody>
            {value.map((row: any, i: number) => (
              <tr key={i}>
                {Object.values(row).map((val, j) => (
                  <td key={j} className="border p-1">{renderValue(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (typeof value === "object" && value !== null) {
      return (
        <div className="ml-2">
          {Object.entries(value).map(([k, v], i) =>
            v != null ? (
              <p key={i}>
                <strong>{k}:</strong> {renderValue(v)}
              </p>
            ) : null
          )}
        </div>
      );
    } else {
      return value ?? "";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Uploaded Documents</h1>

      <Card className="border-2 border-dashed">
        <CardContent
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="p-6 text-center cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-10 w-10 mx-auto mb-2 text-gray-500" />
          <p>Drag & drop files here or click to select</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileUpload}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </CardContent>
      </Card>

      {files.some((f) => f.file) && (
        <Button className="bg-green-600 hover:bg-green-700" onClick={uploadAll}>
          Upload & Extract Data
        </Button>
      )}

      
      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {files.map((f) => (
            <div key={f.id || f._id} className="flex justify-between p-2 border-b items-center">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{f.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                {f.status === "done" && <CheckCircle className="text-green-500 h-5 w-5" />}
                {f.status === "uploading" && <span className="text-yellow-500">Uploading...</span>}
                {f.status === "error" && <AlertCircle className="text-red-500 h-5 w-5" />}
                <X className="h-5 w-5 cursor-pointer" onClick={() => removeFile(f.id || f._id!)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    
      {files.map(
        (f) =>
          f.response && (
            <Card key={f.id || f._id} className="mt-4">
              <CardHeader>
                <CardTitle>Extracted Data: {f.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(f.response).map(([key, val], i) =>
                  val != null ? (
                    <div key={i} className="mb-1">
                      <strong>{key}:</strong> {renderValue(val)}
                    </div>
                  ) : null
                )}
              </CardContent>
            </Card>
          )
      )}
    </div>
  );
};
