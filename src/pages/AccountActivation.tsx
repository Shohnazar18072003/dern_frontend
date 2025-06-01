"use client"
import { useCallback, useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import api from "@/lib/api"

export function AccountActivation() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">("loading")
  const [message, setMessage] = useState("")

  const activateAccount = useCallback(async () => {
    try {
      const response = await api.post("/auth/activate", { token })
      setStatus("success")
      setMessage(response.data.message || "Account activated successfully!")

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error: any) {
      console.error("Activation error:", error)

      if (error.response?.status === 400) {
        const errorMessage = error.response.data.message
        if (errorMessage.includes("expired")) {
          setStatus("expired")
          setMessage("Activation link has expired. Please register again.")
        } else if (errorMessage.includes("already activated")) {
          setStatus("success")
          setMessage("Account is already activated. You can now log in.")
          setTimeout(() => {
            navigate("/login")
          }, 3000)
        } else {
          setStatus("error")
          setMessage(errorMessage || "Invalid activation link")
        }
      } else {
        setStatus("error")
        setMessage("Failed to activate account. Please try again.")
      }
    }
  }, [token, navigate])

  useEffect(() => {
    if (token) {
      activateAccount()
    } else {
      setStatus("error")
      setMessage("Invalid activation link")
    }
  }, [activateAccount, token])

  const getIcon = () => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case "error":
      case "expired":
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
    }
  }

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Activating Your Account..."
      case "success":
        return "Account Activated!"
      case "expired":
        return "Link Expired"
      case "error":
        return "Activation Failed"
      default:
        return "Activating Your Account..."
    }
  }

  const getDescription = () => {
    switch (status) {
      case "loading":
        return "Please wait while we activate your account."
      case "success":
        return "Your account has been successfully activated. You will be redirected to the login page shortly."
      case "expired":
        return "The activation link has expired. Please register again to receive a new activation link."
      case "error":
        return "There was an error activating your account. Please try again or contact support."
      default:
        return "Please wait while we activate your account."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md border-0 bg-card/50 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">{getIcon()}</div>
          <div>
            <CardTitle className="text-2xl">{getTitle()}</CardTitle>
            <CardDescription className="mt-2">{getDescription()}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div
              className={`p-3 text-sm rounded-md text-center ${
                status === "success"
                  ? "text-green-600 bg-green-50 border border-green-200"
                  : status === "expired"
                    ? "text-orange-600 bg-orange-50 border border-orange-200"
                    : "text-red-600 bg-red-50 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-2">
            {status === "success" && (
              <Button className="w-full" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            )}

            {status === "expired" && (
              <Button className="w-full" onClick={() => navigate("/register")}>
                Register Again
              </Button>
            )}

            {status === "error" && (
              <div className="space-y-2">
                <Button className="w-full" onClick={activateAccount}>
                  Try Again
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate("/register")}>
                  Register Again
                </Button>
              </div>
            )}

            <div className="text-center">
              <Link to="/login" className="text-sm text-muted-foreground hover:text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </div>

          {status === "loading" && (
            <div className="text-center text-sm text-muted-foreground">This may take a few moments...</div>
          )}

          {status === "success" && (
            <div className="text-center text-sm text-muted-foreground">Redirecting to login in 3 seconds...</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
