import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FieldLabel, FieldError } from '@/components/ui/field';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';

const signinSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email')
    .required('Email is required'),
  password: yup.string().required('Password is required'),
});

export function SignInForm() {
  const router = useRouter();
  const { signin } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signinSchema),
  });

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      await signin(data.email, data.password);
      router.push('/events');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white border-gray-200 rounded-2xl shadow-lg">
      <CardContent className="pt-6 pb-8 px-6 sm:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="p-4 text-sm text-red-300 bg-red-500/10 rounded-2xl border border-red-500/30 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <FieldLabel
              htmlFor="email"
              className="text-sm font-medium text-gray-700">
              Email Address
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-pfw-gold focus:ring-2 focus:ring-pfw-gold/20"
            />
            {errors.email && (
              <FieldError className="text-red-400">
                {errors.email.message}
              </FieldError>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel
              htmlFor="password"
              className="text-sm font-medium text-gray-700">
              Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                className="h-12 pr-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-pfw-gold focus:ring-2 focus:ring-pfw-gold/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors">
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <FieldError className="text-red-400">
                {errors.password.message}
              </FieldError>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base bg-pfw-gold hover:bg-gold-dark text-black rounded-full shadow-md transition-all hover:scale-105 mt-6"
            disabled={loading}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Sign In
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-600">
                New to Campus Pulse?
              </span>
            </div>
          </div>

          <Link href="/signup">
            <Button
              variant="outline"
              className="w-full h-12 text-base border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-black rounded-full transition-all"
              type="button">
              <Sparkles className="w-5 h-5 mr-2" />
              Create an Account
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
