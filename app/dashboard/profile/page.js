"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, User, Briefcase, MapPin, Calendar, Mail } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          const data = await response.json()
          // Check specifically for auth errors
          if (response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token') // Clear the invalid token
            router.push('/login')
            return
          }
          throw new Error(data.error || 'Failed to fetch user profile')
        }

        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        toast({
          variant: "destructive",
          title: error.message || "Failed to fetch user profile",
        })
        
  // If there's any auth-related error in the message, redirect to login
        // if (error.message?.toLowerCase().includes('token') || 
        //     error.message?.toLowerCase().includes('auth') ||
        //     error.message?.toLowerCase().includes('unauthorized')) {
        //   localStorage.removeItem('token')
        //   router.push('/login')
        // }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [router, toast])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="mb-4">No user data available</p>
        <Button onClick={() => router.push('/login')}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">User Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="w-32 h-32 mx-auto bg-primary rounded-full flex items-center justify-center">
              <User className="w-16 h-16 text-primary-foreground" />
            </div>
          </CardHeader>
          <CardContent className="text-center">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-muted-foreground">{user._id}</p>
            <div className="mt-4 flex justify-center space-x-2">
              <Button variant="outline">Edit Profile</Button>
              <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center">
              <Mail className="mr-2 h-4 w-4" />
              <span className="font-medium">Email:</span>
              <span className="ml-2 ">{user.email}</span>
            </div>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span className="font-medium">Account ID:</span>
              <span className="ml-2">{user._id}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="font-medium">Location:</span>
              <span className="ml-2">N/A</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="mr-2 h-4 w-4" />
              <span className="font-medium">Occupation:</span>
              <span className="ml-2">N/A</span>
            </div>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span className="font-medium">Member Since:</span>
              <span className="ml-2">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}