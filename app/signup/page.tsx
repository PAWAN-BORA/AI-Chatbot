"use client"
import ErrorBox from '@/components/common/ErrorBox';
import Loader from '@/components/common/Loader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';



type SignupPayload = {
  name:string,
  email:string,
  password:string,
}
async function signup(payload:SignupPayload){
  const res = await fetch("/api/signup", {
    method:"POST",
    body:JSON.stringify(payload)
  })
  if(res.ok){
    const result = await res.json();
    return result;
  }
  const errorRes =  await res.json(); 
  throw new Error(errorRes.msg || "Error in getting data.");
}

const SignupForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error|null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError(new Error('All fields are required'));
      return;
    }

    if (password !== confirmPassword) {
      setError(new Error('Passwords do not match'));
      return;
    }

    setError(null);
    setLoading(true);
    console.log('Form Submitted', formData);
    // Reset form (optional)
    try {
      await signup({name, email, password})
      router.push("/login");
    } catch(err) {
      if(err instanceof Error){
        setError(err);
      } else {
        setError(new Error("Server Error."))
      }
    } finally {
      setLoading(false);
    }
    // setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primarygray px-4">
      <div className='bg-white p-8 rounded-xl shadow-md w-full max-w-md'>
        <h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>

        {error && 
          <div className="mb-4 text-center">
            <ErrorBox errMsg={error.message}/> 
          </div>
        }

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-foreground text-background py-2 rounded-md cursor-pointer
            hover:bg-foreground/20 transition flex justify-center 
            disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-default"
            disabled={loading}
          >
            {loading?<Loader size={20}/>:"Sign Up"}
          </button>
        </form>
        <div className="text-sm text-foreground mt-2 text-right">
          Already registered? 
          <Link href="/login" className="text-success hover:underline font-medium ml-1">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
