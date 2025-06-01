"use client";

import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  BookOpen,
  DollarSign,
  User,
  Briefcase,
  Scale,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface Article {
  _id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: { username: string };
  createdAt: string;
  difficulty: string;
  readTime: number;
  featuredImage?: string;
}

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "All Categories", icon: BookOpen },
    { id: "technical", name: "Technical", icon: Info },
    { id: "billing", name: "Billing", icon: DollarSign },
    { id: "account", name: "Account", icon: User },
    { id: "general", name: "General", icon: BookOpen },
    { id: "legal", name: "Legal", icon: Scale },
    { id: "business", name: "Business", icon: Briefcase },
  ]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (selectedCategory !== "all")
          params.append("category", selectedCategory);

        const response = await api.get(`/knowledge-base?${params.toString()}`);
        setArticles(response.data.articles);
        setError("");
      } catch (error: any) {
        console.error("Failed to fetch articles:", error);
        setError(error.response?.data?.message || "Failed to fetch articles");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/knowledge-base/meta/categories");
        const dynamicCategories = response.data.categories.map(
          (category: string) => ({
            id: category,
            name: category.charAt(0).toUpperCase() + category.slice(1),
            icon:
              {
                technical: Info,
                billing: DollarSign,
                account: User,
                general: BookOpen,
                legal: Scale,
                business: Briefcase,
              }[category] || BookOpen,
          })
        );
        setCategories([
          { id: "all", name: "All Categories", icon: BookOpen },
          ...dynamicCategories,
        ]);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

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
    <div className="space-y-6 container mx-auto px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">
          Find solutions to common problems and learn how to manage your account
          and services
        </p>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Articles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for solutions, guides, and tips..."
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
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-full py-0">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article._id} to={`/app/knowledge-base/${article._id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full pt-0">
                {article.featuredImage && (
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="h-40 w-full object-cover rounded-t-lg"
                  />
                )}
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
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{article.readTime} min read</span>
                      <span className="capitalize">{article.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
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
            </Link>
          ))}
        </div>
      )}

      {!loading && articles.length === 0 && (
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
