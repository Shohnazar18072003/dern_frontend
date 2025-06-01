"use client";

import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, User, Share, Link as LinkIcon } from "lucide-react";
import api from "@/lib/api";

interface Article {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: { username: string; email: string };
  createdAt: string;
  updatedAt: string;
  views: number;
  difficulty: string;
  readTime: number;
  featuredImage?: string;
  relatedArticles: { _id: string; title: string }[];
}

export function ArticleDetails() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/knowledge-base/${id}`);
        setArticle(response.data.article);
        setError("");
      } catch (error: any) {
        console.error("Failed to fetch article:", error);
        setError(error.response?.data?.message || "Failed to fetch article");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          url: window.location.href,
        })
        .catch(() => {
          navigator.clipboard.writeText(window.location.href);
          setError("Link copied to clipboard!");
        });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setError("Link copied to clipboard!");
    }
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-1/4 mb-6" />
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col gap-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!article || error === "Failed to fetch article") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Article not found</h2>
        <Link to="/app/knowledge-base">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-x-4 mb-6">
        <Link to="/app/knowledge-base">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </Link>
      </div>

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Article Content */}
        <div className="lg:col-span-3">
          <Card className="pt-0!">
            {article.featuredImage && (
              <img
                src={article.featuredImage}
                alt={article.title}
                className="h-64 w-full object-cover rounded-t-lg"
              />
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center gap-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-x-1">
                      <User className="h-4 w-4" />
                      <span>{article.author.username}</span>
                    </div>
                    <div className="flex items-center gap-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime} min read</span>
                    </div>
                    <span>
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-x-2">
                  <Badge
                    className={`${getDifficultyColor(
                      article.difficulty
                    )} border`}
                  >
                    {article.difficulty}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {article.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
              {article.relatedArticles.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">
                    Related Articles
                  </h3>
                  <div className="flex flex-col gap-y-2">
                    {article.relatedArticles.map((related) => (
                      <Link
                        key={related._id}
                        to={`/app/knowledge-base/${related._id}`}
                        className="flex items-center text-primary hover:underline"
                      >
                        <LinkIcon className="h-4 w-4 mr-2" />
                        {related.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-y-3">
                <span className="text-sm text-muted-foreground">
                  {article.views} views
                </span>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="w-full"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Can't solve your issue? Get personalized support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-y-2">
                <Link to="/app/support-requests/new">
                  <Button className="w-full">Create Support Request</Button>
                </Link>
                <Link to="/app/technicians">
                  <Button variant="outline" className="w-full">
                    Find a Technician
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
