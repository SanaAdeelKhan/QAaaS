// frontend/pages/index.tsx
import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Home() {
  const [status, setStatus] = useState<string>("Idle");

  const runTests = () => {
    // Placeholder — later connect to backend API
    setStatus("Running QA pipeline ⏳");

    setTimeout(() => {
      setStatus("Error running QA pipeline ❌");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-6">QAaaS Dashboard</h1>

      {/* Actions Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>Run QA Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Start the automated QA pipeline and view results.
            </p>
            <Button onClick={runTests} className="w-full">
              Run Tests
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle>View Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">
              Check historical QA runs and performance metrics.
            </p>
            <Button variant="secondary" className="w-full">
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Section */}
      <Card className="mt-8 shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle>Pipeline Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Status:{" "}
            <span
              className={
                status.includes("Error")
                  ? "text-red-600 font-semibold"
                  : status.includes("Running")
                  ? "text-blue-600 font-semibold"
                  : "text-gray-800 font-semibold"
              }
            >
              {status}
            </span>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
