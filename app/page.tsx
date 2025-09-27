
// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getFiles } from "@/lib/actions/file.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { convertFileSize } from "@/lib/utils";

export default function Dashboard() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setError("No session. Please log in again.");
          setLoading(false);
          return;
        }

        const userFiles = await getFiles({
          types: [],
          searchText: "",
          sort: "$createdAt-desc",
        });

        setFiles(userFiles.documents || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 flex flex-col justify-between shadow-md">
        <div>
          <h2 className="text-xl font-bold mb-6">Storage</h2>
          <nav className="space-y-4">
            <button className="block text-left text-red-500 font-semibold">
              Dashboard
            </button>
            <button className="block text-left text-gray-700">Documents</button>
            <button className="block text-left text-gray-700">Images</button>
            <button className="block text-left text-gray-700">Media</button>
            <button className="block text-left text-gray-700">Others</button>
          </nav>
        </div>
        <div className="text-sm text-gray-500">
          <p>Adrian JSM</p>
          <p>adrian@jsmastery.pro</p>
        </div>
      </aside>

      {/* Main content */}
      <section className="flex-1 p-8 overflow-y-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 rounded-lg border w-1/2"
          />
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg shadow">
            Upload
          </button>
        </div>

        {/* Storage usage + summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Circular storage card */}
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500"
                  strokeWidth="3"
                  strokeDasharray="65, 100"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845
                     a 15.9155 15.9155 0 0 1 0 31.831
                     a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold">65%</p>
                <p className="text-xs text-gray-500">Space used</p>
              </div>
            </div>
            <p className="mt-4 text-gray-700">82GB / 128GB</p>
          </div>

          {/* File type cards */}
          <div className="grid grid-cols-2 gap-4 col-span-2">
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="font-bold">Documents</p>
              <p className="text-sm text-gray-500">12 GB</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="font-bold">Images</p>
              <p className="text-sm text-gray-500">20 GB</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="font-bold">Video, Audio</p>
              <p className="text-sm text-gray-500">20 GB</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow text-center">
              <p className="font-bold">Others</p>
              <p className="text-sm text-gray-500">38 GB</p>
            </div>
          </div>
        </div>

        {/* Recent files */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-4">Recent files uploaded</h3>
          {files.length === 0 ? (
            <p className="text-gray-500">No files uploaded yet.</p>
          ) : (
            <ul className="divide-y">
              {files.map((file) => (
                <li
                  key={file.$id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                      {file.extension?.[0]?.toUpperCase() || "F"}
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(file.$createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {convertFileSize(file.size)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

