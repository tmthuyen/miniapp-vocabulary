'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { login } from "@/infrastructure/api/auth-api"
import z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { EyeIcon, EyeOffIcon } from "lucide-react"

const loginEmailPasswordSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loginForm = useForm<z.infer<typeof loginEmailPasswordSchema>>({
    resolver: zodResolver(loginEmailPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "admin@gmail.com",
      password: "123456",
    }
  })

  const { control, reset, handleSubmit, formState: { isValid, isSubmitting } } = loginForm

  const onSubmit = async (data: z.infer<typeof loginEmailPasswordSchema>) => {
    setError(null)
    const { email, password } = data

    const res = await login({ email, password })
    if (!res.success) {
      const errorMessage = res.message || "Failed to sign in"
      const errorDetails = res.details ? ` \nDetails: ${res.details.join(", ")}` : ""
      setError(errorMessage + errorDetails)
      return
    }

    reset({
      email: "",
      password: "",
    })
    toast.success("Signed in successfully", { duration: 900, position: "top-right" })
    setTimeout(() => {
      router.replace("/dashboard")
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your IELTS 8.0 Master account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* API err message */}
          {error && (
            <div className=" p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {error}
            </div>
          )}
          <FieldGroup>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email" className="cursor-pointer">
                    Email
                  </FieldLabel>
                  <Input
                    {...field}
                    id="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password" className="cursor-pointer">
                    Password
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter password"
                      autoComplete="current-password"
                    />
                    <InputGroupAddon align="inline-end" className="cursor-pointer"
                      onClick={() => { setShowPassword(prev => !prev) }}>
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="text-center flex-col">
        <Button type='submit' form='login-form' className="w-full" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/auth/signup" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}


// function LoginForm1() {
//   const router = useRouter()
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [error, setError] = useState<string | null>(null)
//   const [loading, setLoading] = useState(false)

//   useEffect(() => {
//     setEmail("admin@gmail.com")
//     setPassword("123456")
//   }, [])

//   const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     setError(null)
//     setLoading(true)

//     const res = await login({ email, password })
//     if (!res.success) {
//       setError(res.message || "Failed to sign in")
//       setLoading(false)
//       return
//     }

//     setLoading(false)
//     toast.success("Signed in successfully", { duration: 900, position: "top-right" })
//     setTimeout(() => {
//       router.replace("/dashboard")
//     }, 2000)

//   }

//   return (
//     <Card className="w-full max-w-md">
//       <CardHeader className="space-y-1">
//         <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
//         <CardDescription>
//           Sign in to your IELTS 8.0 Master account
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleLogin} className="space-y-4">
//           {error && (
//             <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
//               {error}
//             </div>
//           )}
//           <div className="space-y-2">
//             <label htmlFor="email" className="text-sm font-medium">
//               Email
//             </label>
//             <Input
//               id="email"
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               autoComplete="email"
//               disabled={loading}
//             />
//           </div>
//           <div className="space-y-2">
//             <label htmlFor="password" className="text-sm font-medium">
//               Password
//             </label>
//             <Input
//               id="password"
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               autoComplete="current-password"
//               disabled={loading}
//             />
//           </div>
//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "Signing in..." : "Sign in"}
//           </Button>
//         </form>
//         <div className="mt-4 text-center text-sm">
//           <span className="text-muted-foreground">Don&apos;t have an account? </span>
//           <Link href="/auth/signup" className="text-primary hover:underline font-medium">
//             Sign up
//           </Link>
//         </div>
//       </CardContent>

//     </Card>
//   )
// }

export default LoginForm
