import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, EyeIcon, EyeOffIcon, Mail, Lock, Github, MessageCircle, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCrypto } from '@/contexts/CryptoContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AuthFormProps {
  onComplete: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onComplete }) => {
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Register form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { registerUser, loginUser, socialLogin } = useCrypto();
  const { toast } = useToast();

  // Password validation
  const validatePassword = (password: string): boolean => {
    const hasCapital = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    const newErrors: Record<string, string> = {};
    
    if (!hasCapital) {
      newErrors.password = 'Password must include at least one capital letter';
    } else if (!hasNumber) {
      newErrors.password = 'Password must include at least one number';
    } else if (!hasSpecial) {
      newErrors.password = 'Password must include at least one special character';
    } else if (!isLongEnough) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Reset errors
    setErrors({});
    
    // Basic validation
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      setIsLoading(false);
      return;
    }
    
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'Password is required' }));
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      setIsLoading(false);
      return;
    }
    
    // Validate password requirements
    if (!validatePassword(password)) {
      setIsLoading(false);
      return;
    }
    
    try {
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (data.user) {
        // Call the existing registerUser for local state management
        registerUser(email, password);
        onComplete();
      }
    } catch (error) {
      console.error('Error during registration:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password');
      setIsLoading(false);
      return;
    }
    
    try {
      // Login with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) {
        setLoginError(error.message);
        setIsLoading(false);
        return;
      }
      
      if (data.user) {
        // Call the existing loginUser for local state management
        loginUser({
          email: loginEmail,
          password: loginPassword
        });
        onComplete();
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoginError('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social login
  const handleSocialLogin = async (provider: 'github' | 'google') => {
    try {
      setIsLoading(true);
      
      let { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + '/auth/callback',
        },
      });
      
      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // NOTE: The user will be redirected away from the app by Supabase
      // and return after successful auth, so we don't need to call onComplete here
      
      // For the mock functionality to work in development
      socialLogin(provider as any);
      onComplete();
      
    } catch (error) {
      console.error(`Error during ${provider} login:`, error);
      toast({
        title: "Authentication Error",
        description: `An error occurred during ${provider} authentication.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Telegram login
  const handleTelegramLogin = () => {
    try {
      setIsLoading(true);
      
      // For now, we'll use the mock implementation for Telegram
      socialLogin('telegram' as any);
      onComplete();
      
      toast({
        title: "Demo Mode",
        description: "Telegram login is in demo mode. In a production environment, you would need to implement the Telegram Login Widget.",
      });
    } catch (error) {
      console.error('Error during Telegram login:', error);
      toast({
        title: "Authentication Error",
        description: "An error occurred during Telegram authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">ScremyCoin</CardTitle>
          <CardDescription className="text-center">
            Sign up or login to start mining ScremyCoin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="loginEmail"
                      placeholder="name@example.com"
                      type="email"
                      className="pl-10"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loginPassword">Password</Label>
                    <a href="#" className="text-xs text-muted-foreground hover:text-primary">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="loginPassword"
                      type="password"
                      className="pl-10"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-scremy hover:bg-scremy/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`pl-10 ${errors.password ? 'border-destructive' : ''}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters and include a capital letter, 
                    a number, and a special character.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      className={`pl-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-scremy hover:bg-scremy/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
            >
              <Github className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleTelegramLogin}
              disabled={isLoading}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <LogIn className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthForm;
