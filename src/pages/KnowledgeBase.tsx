"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  BookOpen,
  Monitor,
  Smartphone,
  Wifi,
  Shield,
  HardDrive,
  Zap,
} from "lucide-react";

export function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Categories", icon: BookOpen },
    { id: "hardware", name: "Hardware", icon: Monitor },
    { id: "software", name: "Software", icon: Smartphone },
    { id: "network", name: "Network", icon: Wifi },
    { id: "security", name: "Security", icon: Shield },
    { id: "storage", name: "Storage", icon: HardDrive },
    { id: "power", name: "Power Issues", icon: Zap },
  ];

  const articles = [
    {
      id: 1,
      title: "How to Fix a Slow Computer",
      description:
        "Step-by-step guide to diagnose and fix performance issues on Windows and Mac computers.",
      category: "software",
      difficulty: "Beginner",
      readTime: "5 min",
      tags: ["performance", "windows", "mac", "optimization"],
    },
    {
      id: 2,
      title: "Troubleshooting Network Connectivity Issues",
      description:
        "Common network problems and their solutions for home and office environments.",
      category: "network",
      difficulty: "Intermediate",
      readTime: "8 min",
      tags: ["wifi", "ethernet", "router", "connectivity"],
    },
    {
      id: 3,
      title: "Computer Won't Turn On - Diagnosis Guide",
      description:
        "Complete troubleshooting guide for computers that won't power on or boot properly.",
      category: "hardware",
      difficulty: "Intermediate",
      readTime: "10 min",
      tags: ["power", "boot", "hardware", "diagnosis"],
    },
    {
      id: 4,
      title: "Malware Removal and Prevention",
      description:
        "How to detect, remove, and prevent malware infections on your computer system.",
      category: "security",
      difficulty: "Beginner",
      readTime: "12 min",
      tags: ["malware", "antivirus", "security", "prevention"],
    },
    {
      id: 5,
      title: "Hard Drive Recovery and Backup",
      description:
        "Data recovery techniques and backup strategies to protect your important files.",
      category: "storage",
      difficulty: "Advanced",
      readTime: "15 min",
      tags: ["backup", "recovery", "data", "storage"],
    },
    {
      id: 6,
      title: "Blue Screen of Death (BSOD) Solutions",
      description:
        "Understanding and fixing Windows Blue Screen errors with detailed troubleshooting steps.",
      category: "software",
      difficulty: "Advanced",
      readTime: "20 min",
      tags: ["bsod", "windows", "crash", "troubleshooting"],
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Intermediate":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "Advanced":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Find solutions to common IT problems and learn how to fix issues
          yourself
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for solutions, guides, and troubleshooting tips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                className="flex flex-col items-center space-y-2 h-auto py-4"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="h-6 w-6" />
                <span className="text-xs">{category.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <Card
            key={article.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg leading-tight">
                  {article.title}
                </CardTitle>
                <Badge
                  className={`${getDifficultyColor(
                    article.difficulty
                  )} border text-xs`}
                >
                  {article.difficulty}
                </Badge>
              </div>
              <CardDescription className="line-clamp-3">
                {article.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{article.readTime} read</span>
                  <span className="capitalize">{article.category}</span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {article.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{article.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <Button className="w-full" variant="outline">
                  Read Article
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search terms or browse different categories.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
