"use client";

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
import {
  ArrowLeft,
  Clock,
  User,
  ThumbsUp,
  ThumbsDown,
  Share,
  Bookmark,
} from "lucide-react";

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  difficulty: string;
  readTime: string;
  tags: string[];
  author: string;
  publishedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  dislikes: number;
}

export function ArticleDetails() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const fetchArticle = async () => {
    try {
      // Mock data - replace with actual API call
      const mockArticle: Article = {
        id: parseInt(id!),
        title: "How to Fix a Slow Computer",
        content: `
# How to Fix a Slow Computer

A slow computer can be frustrating and impact your productivity. This comprehensive guide will walk you through the most effective methods to diagnose and fix performance issues on both Windows and Mac computers.

## Common Causes of Slow Performance

Before diving into solutions, it's important to understand what might be causing your computer to run slowly:

- **Insufficient RAM**: Not enough memory to run multiple programs
- **Full hard drive**: Less than 15% free space can significantly slow down your system
- **Malware and viruses**: Malicious software consuming system resources
- **Too many startup programs**: Programs that automatically start with your computer
- **Outdated hardware**: Aging components that can't keep up with modern software
- **Background processes**: Unnecessary programs running in the background

## Step-by-Step Solutions

### 1. Check Available Storage Space

**Windows:**
1. Open File Explorer
2. Right-click on your main drive (usually C:)
3. Select "Properties"
4. Check the available space

**Mac:**
1. Click the Apple menu
2. Select "About This Mac"
3. Click "Storage" tab

**Solution:** If you have less than 15% free space, delete unnecessary files or move them to external storage.

### 2. Disable Startup Programs

**Windows:**
1. Press Ctrl + Shift + Esc to open Task Manager
2. Click the "Startup" tab
3. Right-click on programs you don't need at startup
4. Select "Disable"

**Mac:**
1. Go to System Preferences
2. Click "Users & Groups"
3. Select your user account
4. Click "Login Items"
5. Remove unnecessary programs

### 3. Run Disk Cleanup

**Windows:**
1. Type "Disk Cleanup" in the Start menu
2. Select your main drive
3. Check all boxes except "Downloads"
4. Click "OK" and "Delete Files"

**Mac:**
1. Use built-in "Optimize Storage" recommendations
2. Empty Trash regularly
3. Clear browser cache and downloads

### 4. Check for Malware

- Run a full system scan with your antivirus software
- Use Windows Defender (Windows) or run Malware Detection (Mac)
- Consider using additional tools like Malwarebytes for thorough scanning

### 5. Update Your System and Drivers

- Install all available system updates
- Update device drivers, especially graphics drivers
- Keep your software up to date

### 6. Add More RAM (If Possible)

If your computer consistently uses more than 80% of available RAM:
- Consider upgrading to more RAM
- Check your computer's maximum supported RAM
- Consult a technician for installation if needed

## Advanced Solutions

### Registry Cleanup (Windows Only)

**Warning:** Only attempt this if you're comfortable with advanced system settings.

1. Press Win + R, type "regedit"
2. Back up your registry first
3. Use a reputable registry cleaner tool
4. Restart your computer

### Reset SMC and PRAM (Mac Only)

**SMC Reset:**
1. Shut down your Mac
2. Press Shift + Control + Option + Power for 10 seconds
3. Release all keys and restart

**PRAM Reset:**
1. Shut down your Mac
2. Press Command + Option + P + R during startup
3. Hold until you hear the startup sound twice

## When to Seek Professional Help

Contact a technician if:
- Your computer is more than 5 years old and consistently slow
- You've tried all solutions without improvement
- You suspect hardware failure
- You're not comfortable performing advanced troubleshooting

## Prevention Tips

- Restart your computer regularly (at least once a week)
- Keep your desktop clean and organized
- Uninstall programs you no longer use
- Run regular maintenance scans
- Keep your system updated
- Use an SSD instead of a traditional hard drive if possible

## Conclusion

Most computer slowdowns can be resolved with these basic maintenance steps. Regular upkeep and good computing habits will help prevent performance issues in the future. If problems persist, don't hesitate to contact our support team for professional assistance.
        `,
        category: "software",
        difficulty: "Beginner",
        readTime: "5 min",
        tags: ["performance", "windows", "mac", "optimization"],
        author: "Tech Support Team",
        publishedAt: "2024-01-15",
        updatedAt: "2024-01-20",
        views: 1247,
        likes: 89,
        dislikes: 3,
      };

      setArticle(mockArticle);
    } catch (error) {
      console.error("Failed to fetch article:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // Show toast notification
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-12">
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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/app/knowledge-base">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Knowledge Base
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Article Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">
                    {article.title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{article.readTime} read</span>
                    </div>
                    <span>
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                <div
                  dangerouslySetInnerHTML={{
                    __html: article.content.replace(/\n/g, "<br>"),
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Article Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Article Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {article.views} views
                  </span>
                </div>

                <Separator />

                <div className="flex items-center space-x-2">
                  <Button
                    variant={liked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    className="flex-1"
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {article.likes + (liked ? 1 : 0)}
                  </Button>
                  <Button
                    variant={disliked ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleDislike}
                    className="flex-1"
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    {article.dislikes + (disliked ? 1 : 0)}
                  </Button>
                </div>

                <Button
                  variant={bookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={handleBookmark}
                  className="w-full"
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  {bookmarked ? "Bookmarked" : "Bookmark"}
                </Button>

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

          {/* Tags */}
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

          {/* Need Help? */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>
                Can't solve your issue? Get personalized support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
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
