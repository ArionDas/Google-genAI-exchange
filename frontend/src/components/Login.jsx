import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import Spinner from "./ui/Spinner"
import axios from 'axios'

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required(),
})

function Login({ user,setUser }) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')
    try {
      const uri = `${import.meta.env.VITE_API_URL}/api/auth/login`;
      console.log('API URL:', uri);

      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const body = JSON.stringify({
        email: data.email,
        password: data.password,
      });

      const response = await axios.post(uri, body, config);

      console.log('Response:', response);
      
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
       
        const userInfo = {
          id: user.id,
          name: user.name,
          email: user.email
        };
        localStorage.setItem('user', JSON.stringify(userInfo));
       
       
        navigate('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner />
                <span className="ml-2">Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Login