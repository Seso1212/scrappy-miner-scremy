
import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, UserCircle, Mail, Phone, Lock, MapPin, AtSign, BrandTelegram } from 'lucide-react';
import { DataService, UserAuth } from '@/lib/dataService';
import { useCrypto } from '@/contexts/CryptoContext';

// Authentication page component
const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useCrypto();
  const [isLoggedIn, setIsLoggedIn] = useState(DataService.isLoggedIn());
  
  // If already logged in, redirect to dashboard
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background/80 to-secondary/20">
      <Card className="w-full max-w-md shadow-xl border-muted/20">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome to ScremyCoin</CardTitle>
          <CardDescription>Sign in or create an account to start mining</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <SignInForm onSuccess={() => {
                setIsLoggedIn(true);
                login();
                navigate('/');
              }} />
            </TabsContent>
            
            <TabsContent value="signup">
              <SignUpForm onSuccess={() => {
                setIsLoggedIn(true);
                login();
                navigate('/');
              }} />
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="text-center text-xs text-muted-foreground">
          By continuing, you agree to ScremyCoin's Terms of Service and Privacy Policy.
        </CardFooter>
      </Card>
    </div>
  );
};

// Sign In Form Component
const SignInForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    pin: ''
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate form
    if (!formData.email || !formData.pin) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Attempt login
    setTimeout(() => {
      const user = DataService.loginUser({
        email: formData.email,
        pin: formData.pin
      });
      
      if (user) {
        toast({
          title: "Welcome back!",
          description: `Signed in as ${user.fullName}`,
        });
        onSuccess();
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or PIN",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="yourname@example.com" 
            className="pl-10"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="pin">PIN</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            id="pin" 
            name="pin" 
            type="password" 
            placeholder="At least 4 digits" 
            className="pl-10"
            value={formData.pin}
            onChange={handleChange}
            disabled={isLoading}
            minLength={4}
            required
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          <>Sign In</>
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account? Switch to Sign Up.
        </p>
      </div>
    </form>
  );
};

// Sign Up Form Component
const SignUpForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    religion: '',
    phoneNumber: '',
    city: '',
    pin: '',
    confirmPin: '',
    provider: 'email' as UserAuth['provider'],
    isEmailVerified: false,
    isPhoneVerified: false,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const verifyEmail = () => {
    setIsLoading(true);
    
    // Simulate email verification process
    setTimeout(() => {
      setFormData(prev => ({ ...prev, isEmailVerified: true }));
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified",
      });
      setIsLoading(false);
    }, 1500);
  };
  
  const verifyPhone = () => {
    setIsLoading(true);
    
    // Simulate phone verification process
    setTimeout(() => {
      setFormData(prev => ({ ...prev, isPhoneVerified: true }));
      toast({
        title: "Phone Verified",
        description: "Your phone number has been successfully verified",
      });
      setIsLoading(false);
    }, 1500);
  };
  
  const handleGoogleSignUp = () => {
    setIsLoading(true);
    
    // Simulate Google OAuth
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        provider: 'google',
        email: 'user@gmail.com',
        fullName: 'Google User',
        isEmailVerified: true
      }));
      setStep(2);
      setIsLoading(false);
      
      toast({
        title: "Google Authentication Successful",
        description: "Please complete your profile",
      });
    }, 1500);
  };
  
  const handleTelegramSignUp = () => {
    setIsLoading(true);
    
    // Simulate Telegram OAuth
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        provider: 'telegram',
        fullName: 'Telegram User',
        phoneNumber: '+1234567890',
        isPhoneVerified: true
      }));
      setStep(2);
      setIsLoading(false);
      
      toast({
        title: "Telegram Authentication Successful",
        description: "Please complete your profile",
      });
    }, 1500);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setIsLoading(true);
    
    // Validate form for final submission
    if (!formData.email || !formData.fullName || !formData.pin) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    if (formData.pin !== formData.confirmPin) {
      toast({
        title: "Error",
        description: "PINs do not match",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    if (formData.pin.length < 4) {
      toast({
        title: "Error",
        description: "PIN must be at least 4 digits",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    // Register user
    setTimeout(() => {
      try {
        const user = DataService.registerUser({
          email: formData.email,
          fullName: formData.fullName,
          religion: formData.religion || undefined,
          phoneNumber: formData.phoneNumber || undefined,
          city: formData.city || undefined, 
          pin: formData.pin,
          provider: formData.provider,
          isEmailVerified: formData.isEmailVerified,
          isPhoneVerified: formData.isPhoneVerified
        });
        
        toast({
          title: "Account Created",
          description: "Welcome to ScremyCoin!",
        });
        
        onSuccess();
      } catch (error) {
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : "An unknown error occurred",
          variant: "destructive"
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {step === 1 ? (
        // Step 1: Choose authentication method
        <>
          <div className="space-y-4">
            <p className="text-sm text-center text-muted-foreground mb-2">
              Sign up with your preferred method
            </p>
            
            <Button
              type="button"
              className="w-full bg-white text-black hover:bg-gray-100 border border-gray-300"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </Button>
            
            <Button
              type="button"
              className="w-full bg-[#0088cc] hover:bg-[#0099dd]"
              onClick={handleTelegramSignUp}
              disabled={isLoading}
            >
              <BrandTelegram className="mr-2 h-4 w-4" />
              Continue with Telegram
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="signup-email" 
                  name="email" 
                  type="email" 
                  placeholder="yourname@example.com" 
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="fullName" 
                  name="fullName" 
                  placeholder="Your full name" 
                  className="pl-10"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Continue</>
              )}
            </Button>
          </div>
        </>
      ) : (
        // Step 2: Additional information
        <>
          <div className="space-y-4">
            <p className="text-sm text-center font-medium mb-2">
              Complete your profile (KYC information)
            </p>
            
            {/* Show email field if not verified */}
            {!formData.isEmailVerified && (
              <div className="space-y-2">
                <Label htmlFor="verify-email" className="flex justify-between">
                  <span>Email</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={verifyEmail}
                    disabled={isLoading || !formData.email}
                    className="h-auto py-0 px-2 text-xs"
                  >
                    Verify
                  </Button>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="verify-email" 
                    name="email" 
                    type="email" 
                    placeholder="yourname@example.com" 
                    className="pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading || formData.isEmailVerified}
                  />
                </div>
                {formData.isEmailVerified && (
                  <p className="text-xs text-green-500">Email verified</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="religion">Religion (Optional)</Label>
              <Input 
                id="religion" 
                name="religion" 
                placeholder="Your religion" 
                value={formData.religion}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City (Optional)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="city" 
                  name="city" 
                  placeholder="Your city" 
                  className="pl-10"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Show phone field if not verified */}
            {!formData.isPhoneVerified && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="flex justify-between">
                  <span>Phone Number (Optional)</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={verifyPhone}
                    disabled={isLoading || !formData.phoneNumber}
                    className="h-auto py-0 px-2 text-xs"
                  >
                    Verify
                  </Button>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    placeholder="+1 234 567 8900" 
                    className="pl-10"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={isLoading || formData.isPhoneVerified}
                  />
                </div>
                {formData.isPhoneVerified && (
                  <p className="text-xs text-green-500">Phone verified</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="pin">PIN (At least 4 digits)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="pin" 
                  name="pin" 
                  type="password" 
                  placeholder="Enter PIN" 
                  className="pl-10"
                  value={formData.pin}
                  onChange={handleChange}
                  disabled={isLoading}
                  minLength={4}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="confirmPin" 
                  name="confirmPin" 
                  type="password" 
                  placeholder="Confirm PIN" 
                  className="pl-10"
                  value={formData.confirmPin}
                  onChange={handleChange}
                  disabled={isLoading}
                  minLength={4}
                  required
                />
              </div>
              {formData.pin && formData.confirmPin && formData.pin !== formData.confirmPin && (
                <p className="text-xs text-red-500">PINs do not match</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox id="terms" required />
              <Label htmlFor="terms" className="text-sm">
                I agree to the Terms of Service and Privacy Policy
              </Label>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>Create Account</>
              )}
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default Auth;
