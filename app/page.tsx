
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFiles } from "@/lib/actions/file.actions";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { convertFileSize } from "@/lib/utils";
import { createSessionClient } from "@/lib/appwrite";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Storage info
  const [totalSize, setTotalSize] = useState(0);
  const [categorySizes, setCategorySizes] = useState({
    documents: 0,
    images: 0,
    media: 0,
    others: 0,
  });

  const STORAGE_LIMIT = 128 * 1024 * 1024 * 1024; // 128 GB in bytes

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push("/sign-in");
          return;
        }

        setUser(user);

        const userFiles = await getFiles({
          types: [],
          searchText: "",
          sort: "$createdAt-desc",
        });

        const docs = userFiles.documents || [];
        setFiles(docs);

        // 🔹 Calculate storage usage
        let total = 0;
        let categories = { documents: 0, images: 0, media: 0, others: 0 };

        docs.forEach((file: any) => {
          total += file.size;

          const ext = file.extension?.toLowerCase() || "";
          if (["pdf", "doc", "docx", "xls", "xlsx", "ppt"].includes(ext)) {
            categories.documents += file.size;
          } else if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
            categories.images += file.size;
          } else if (["mp4", "avi", "mkv", "mp3", "wav"].includes(ext)) {
            categories.media += file.size;
          } else {
            categories.others += file.size;
          }
        });

        setTotalSize(total);
        setCategorySizes(categories);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      const { account } = await createSessionClient();
      await account.deleteSession("current"); // 🔹 Appwrite logout
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </main>
    );
  }

  // % used
  const usedPercentage = Math.min(
    Math.round((totalSize / STORAGE_LIMIT) * 100),
    100
  );

  return (
    <main className="flex h-screen bg-gray-100">
      {/* Sidebar */}

        <Sidebar {...user} />
      

      {/* Main content */}
      <section className="flex-1 p-8 overflow-y-auto">
        {/* Top bar */}
        
        {/* <<div className="flex items-center justify-between mb-8">
          <input
            type="text"
            placeholder="Search..."
            className="px-4 py-2 rounded-lg border w-1/2 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <div className="flex gap-4">
            <button className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow hover:bg-pink-600">
              Upload
            </button>
            <button
              onClick={handleLogout}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>> */}

        {/* Grid main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Storage usage */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <div className="flex items-center gap-6">
              {/* Progress circle */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#f1f1f1"
                    strokeWidth="16"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="#ec4899"
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={
                      (1 - usedPercentage / 100) * 2 * Math.PI * 54
                    }
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{usedPercentage}%</span>
                  <span className="text-sm text-gray-500">Space used</span>
                </div>
              </div>
              {/* Text info */}
              <div>
                <p className="text-gray-600">Available Storage</p>
                <p className="text-lg font-semibold">
                  {convertFileSize(totalSize)} / {convertFileSize(STORAGE_LIMIT)}
                </p>
              </div>
            </div>

            {/* Type cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="p-4 rounded-lg bg-red-50">
                <p className="font-semibold">Documents</p>
                <p className="text-lg">
                  {convertFileSize(categorySizes.documents)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <p className="font-semibold">Images</p>
                <p className="text-lg">
                  {convertFileSize(categorySizes.images)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50">
                <p className="font-semibold">Media</p>
                <p className="text-lg">
                  {convertFileSize(categorySizes.media)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50">
                <p className="font-semibold">Others</p>
                <p className="text-lg">
                  {convertFileSize(categorySizes.others)}
                </p>
              </div>
            </div>
          </div>

          {/* Recent files */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-4">Recent files uploaded</h2>
            {files.length === 0 ? (
              <p className="text-gray-500">No files uploaded yet.</p>
            ) : (
              <ul className="space-y-3">
                {files.slice(0, 6).map((file) => (
                  <li
                    key={file.$id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full text-white text-sm
                        ${
                          ["pdf", "doc", "docx"].includes(
                            file.extension?.toLowerCase()
                          )
                            ? "bg-red-500"
                            : ["jpg", "jpeg", "png", "gif"].includes(
                                file.extension?.toLowerCase()
                              )
                            ? "bg-blue-500"
                            : ["mp4", "avi", "mp3"].includes(
                                file.extension?.toLowerCase()
                              )
                            ? "bg-green-500"
                            : "bg-purple-500"
                        }`}
                      >
                        {file.extension?.[0]?.toUpperCase() || "F"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
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
        </div>
      </section>
    </main>
  );
}
