import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Gavel, Shield, Clock, CheckCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
  const cardRef = useRef(null);
  const featuresRef = useRef(null);
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // Intersection Observer for scroll animations
  useEffect(() => {
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsCardVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const featuresObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsFeaturesVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Copy ref values to variables for cleanup
    const currentCardRef = cardRef.current;
    const currentFeaturesRef = featuresRef.current;

    if (currentCardRef) {
      cardObserver.observe(currentCardRef);
    }
    if (currentFeaturesRef) {
      featuresObserver.observe(currentFeaturesRef);
    }

    return () => {
      if (currentCardRef) {
        cardObserver.unobserve(currentCardRef);
      }
      if (currentFeaturesRef) {
        featuresObserver.unobserve(currentFeaturesRef);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await signUp(email, password, fullName);
        if (signUpError) {
          let errorMessage = signUpError.message || 'Failed to create account';
          // Provide more helpful error messages
          if (errorMessage.includes('already registered')) {
            errorMessage = 'This email is already registered. Please sign in instead.';
          } else if (errorMessage.includes('password')) {
            errorMessage = 'Password must be at least 6 characters long.';
          }
          setError(errorMessage);
        } else {
          // Check if email confirmation is required
          if (data?.user && !data.session) {
            setError('Account created! Please check your email to verify your account, then sign in.');
            setIsSignUp(false);
          } else {
            // User is automatically signed in
            navigate('/search');
          }
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          let errorMessage = signInError.message || 'Failed to sign in';
          // Provide more helpful error messages
          if (errorMessage.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. If you just signed up, please check your email for a confirmation link.';
          } else if (errorMessage.includes('Email not confirmed')) {
            errorMessage = 'Please check your email and click the confirmation link before signing in.';
          }
          setError(errorMessage);
        } else {
          navigate('/search');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-40">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Medical Simplifier</h1>
              <p className="text-lg mb-8 text-white/90">
                Turn complex legal documents into clear, plain-language summaries.
                Get AI guidance and find nearby lawyers or legal clinics when you need help.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span>Secure and private processing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span>Instant legal document simplification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <span>AI-powered legal guidance and referrals</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://image2url.com/images/1762628977810-6db39b1f-9348-4263-b8a2-a2afa627d74b.png"
                  alt="Medical care"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login/Sign Up Form */}
      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div 
          ref={cardRef}
          className={`max-w-2xl mx-auto transition-all duration-700 ease-out ${
            isCardVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <Card className="shadow-xl bg-blue-50">
            <CardHeader className="space-y-1">
              <CardTitle>{isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}</CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Get started with your medical information portal'
                  : 'Enter your credentials to access the medical simplifier'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={isSignUp ? 6 : undefined}
                  />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
                  </Button>
                </div>
              </form>
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isSignUp ? (
                    <>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="text-amber-800 hover:underline font-medium"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="text-amber-800 hover:underline font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div 
            ref={featuresRef}
            className={`mt-12 grid gap-6 transition-all duration-700 ease-out delay-200 ${
              isFeaturesVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-amber-800 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Simple Instruction Translation</h3>
                <p className="text-gray-600 text-sm">Transform legal language into easy-to-understand summaries</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-amber-800 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Assistance</h3>
                <p className="text-gray-600 text-sm">Your personal AI legal assistant, available 24/7 for document questions</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-amber-800 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Easy Access Anywhere</h3>
                <p className="text-gray-600 text-sm">Find legal help and review documents from any device, anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
