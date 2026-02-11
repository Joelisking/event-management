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
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const signUpSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  organizationName: yup.string().optional(),
  userCategory: yup
    .string()
    .oneOf(
      ['pfw_student', 'pfw_alumni', 'community', 'international'],
      'Invalid category'
    )
    .required('Please select a category'),
  countryOfResidence: yup.string().when('userCategory', {
    is: 'international',
    then: (schema) =>
      schema.required(
        'Country of residence is required for international users'
      ),
    otherwise: (schema) => schema.notRequired(),
  }),
  countryOfOrigin: yup.string().optional(),
});

export function SignUpForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signUpSchema),
  });

  const selectedCategory = watch('userCategory');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);

    try {
      await signup(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        'student', // All users are students by default
        data.organizationName,
        data.userCategory,
        data.countryOfResidence,
        data.countryOfOrigin
      );
      router.push('/events');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white border-gray-200 backdrop-blur-xl rounded-2xl shadow-2xl shadow-pfw-gold/10">
      <CardContent className="pt-6 pb-8 px-6 sm:px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-4 text-sm text-red-300 bg-red-500/10 rounded-2xl border border-red-500/30 backdrop-blur-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FieldLabel
                htmlFor="firstName"
                className="text-sm font-medium text-gray-700">
                First Name
              </FieldLabel>
              <Input
                id="firstName"
                type="text"
                {...register('firstName')}
                placeholder="John"
                className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
              />
              {errors.firstName && (
                <FieldError className="text-red-400 text-xs">
                  {errors.firstName.message}
                </FieldError>
              )}
            </div>

            <div className="space-y-2">
              <FieldLabel
                htmlFor="lastName"
                className="text-sm font-medium text-gray-700">
                Last Name
              </FieldLabel>
              <Input
                id="lastName"
                type="text"
                {...register('lastName')}
                placeholder="Doe"
                className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
              />
              {errors.lastName && (
                <FieldError className="text-red-400 text-xs">
                  {errors.lastName.message}
                </FieldError>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <FieldLabel
              htmlFor="email"
              className="text-sm font-medium text-gray-700">
              Email Address
            </FieldLabel>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.doe@example.com"
              className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
            />
            {errors.email && (
              <FieldError className="text-red-400 text-xs">
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
                {...register('password')}
                placeholder="••••••••"
                className="h-11 pr-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 focus:outline-none transition-colors">
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <FieldError className="text-red-400 text-xs">
                {errors.password.message}
              </FieldError>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700">
              Confirm Password
            </FieldLabel>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                className="h-11 pr-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700 focus:outline-none transition-colors">
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <FieldError className="text-red-400 text-xs">
                {errors.confirmPassword.message}
              </FieldError>
            )}
          </div>

          <div className="space-y-2">
            <FieldLabel
              htmlFor="userCategory"
              className="text-sm font-medium text-gray-700">
              User Category
            </FieldLabel>
            <select
              id="userCategory"
              {...register('userCategory')}
              className="flex h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 ring-offset-background placeholder:text-black0 focus:border-pfw-gold/30 focus:outline-none focus:ring-2 focus:ring-pfw-gold/20 disabled:cursor-not-allowed disabled:opacity-50">
              <option
                value=""
                className="bg-gray-50 text-gray-600">
                Select category...
              </option>
              <option
                value="pfw_student"
                className="bg-gray-50 text-gray-900">
                PFW Student
              </option>
              <option
                value="pfw_alumni"
                className="bg-gray-50 text-gray-900">
                PFW Alumni
              </option>
              <option
                value="community"
                className="bg-gray-50 text-gray-900">
                Community Member
              </option>
              <option
                value="international"
                className="bg-gray-50 text-gray-900">
                International
              </option>
            </select>
            {errors.userCategory && (
              <FieldError className="text-red-400 text-xs">
                {errors.userCategory.message}
              </FieldError>
            )}
          </div>

          {selectedCategory === 'international' && (
            <>
              <div className="space-y-2">
                <FieldLabel
                  htmlFor="countryOfResidence"
                  className="text-sm font-medium text-gray-700">
                  Country of Residence{' '}
                  <span className="text-red-400">*</span>
                </FieldLabel>
                <Input
                  id="countryOfResidence"
                  type="text"
                  {...register('countryOfResidence')}
                  placeholder="e.g., United States"
                  className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
                />
                {errors.countryOfResidence && (
                  <FieldError className="text-red-400 text-xs">
                    {errors.countryOfResidence.message}
                  </FieldError>
                )}
                <p className="text-xs text-gray-600">
                  Where do you currently reside?
                </p>
              </div>

              <div className="space-y-2">
                <FieldLabel
                  htmlFor="countryOfOrigin"
                  className="text-sm font-medium text-gray-700">
                  Country of Origin{' '}
                  <span className="text-black0 font-normal">
                    (Optional)
                  </span>
                </FieldLabel>
                <Input
                  id="countryOfOrigin"
                  type="text"
                  {...register('countryOfOrigin')}
                  placeholder="e.g., Mexico"
                  className="h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-black0 rounded-xl focus:border-pfw-gold/30 focus:ring-2 focus:ring-pfw-gold/20"
                />
                {errors.countryOfOrigin && (
                  <FieldError className="text-red-400 text-xs">
                    {errors.countryOfOrigin.message}
                  </FieldError>
                )}
                <p className="text-xs text-gray-600">
                  If different from your country of residence
                </p>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base bg-pfw-gold hover:bg-gold-dark text-white rounded-full shadow-lg shadow-pfw-gold/20 transition-all hover:scale-105 mt-6"
            disabled={loading}>
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-600">
                Already have an account?
              </span>
            </div>
          </div>

          <Link href="/signin">
            <Button
              variant="outline"
              className="w-full h-12 text-base border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 rounded-full transition-all"
              type="button">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
