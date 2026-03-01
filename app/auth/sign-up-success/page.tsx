import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">StockSim</span>
          </div>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-2xl text-card-foreground">Check your email</CardTitle>
              <CardDescription className="text-muted-foreground">
                {"We've sent you a confirmation link"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Please check your email and click the confirmation link to activate your account. Once confirmed, you can start trading with $100,000 in virtual cash.
              </p>
              <Link href="/auth/login" className="text-sm text-center text-primary underline underline-offset-4">
                Back to sign in
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
