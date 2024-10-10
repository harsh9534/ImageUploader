import React, { useEffect, useState } from "react";
import { Moon, Sun, Upload, Trash2, Search } from "lucide-react";
import { useTheme } from "next-themes";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader } from "../components/ui/loader.tsx"; // Assuming you have a Loader component

interface Image {
  id: string;
  url: string;
  name: string;
  uploadDate: string;
}

export default function Dashboard() {
  const [images, setImages] = useState<Image[]>([]);
  const [uploading, setUploading] = useState(false);
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);

  // Fetch images from backend when component mounts
  useEffect(() => {
    const fetchImages = async () => {
      const token = localStorage.getItem("accessToken");
      try {
        const response = await axios.get("http://127.0.0.1:5000/images", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("response :", response.data);
        // Process the response and format it for the UI
        const fetchedImages = response.data.images.map((img: any) => ({
          id: img.filename, // Use filename as id for simplicity
          url: img.url, // The image URL from backend
          name: img.filename, // Use filename as image name
          uploadDate: new Date().toISOString().split("T")[0], // Dummy upload date
        }));

        setImages(fetchedImages);
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false); // Turn off the loading state once done
      }
    };

    fetchImages();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { file_url } = response.data;

      const newImage: Image = {
        id: Date.now().toString(),
        url: file_url,
        name: file.name,
        uploadDate: new Date().toISOString().split("T")[0],
      };

      setImages([...images, newImage]);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, url: string) => {
    const token = localStorage.getItem("accessToken");

    try {
      // Make DELETE request to backend
      const response = await axios.delete("http://127.0.0.1:5000/delete", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {
          file_url: url, // Send file_url in the request body
        },
      });

      if (response.status === 200) {
        // Remove the deleted image from the UI
        setImages(images.filter((img) => img.id !== id));
      } else {
        console.error("Failed to delete the image:", response.data);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleAnalyze = (id: string) => {
    console.log(`Analyzing image with id: ${id}`);
    // Implement AI analysis logic here
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Image Upload Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() =>
                setTheme(theme === "light" ? "dark" : "light")
              }
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {theme === "light" ? (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                  ) : (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader /> {/* Loader component */}
          </div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Upload New Image</CardTitle>
                <CardDescription>
                  Select an image file to upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="flex-grow"
                  />
                  <Button disabled={uploading}>
                    <Upload className="mr-2 h-4 w-4" />{" "}
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Images</CardTitle>
                <CardDescription>
                  Manage and analyze your uploaded images
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <Card key={image.id}>
                      <CardContent className="p-4">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-40 object-cover rounded-md mb-4"
                        />
                        <h3 className="font-semibold mb-2">{image.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Uploaded on {image.uploadDate}
                        </p>
                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAnalyze(image.id)}
                          >
                            <Search className="mr-2 h-4 w-4" /> Analyze
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(image.id, image.url)} // Pass id and url for deletion
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
