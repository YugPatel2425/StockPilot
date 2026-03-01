import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-2xl text-card-foreground">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {params?.error ? `Error: ${params.error}` : 'An unspecified error occurred.'}
            </p>
            <Link href="/auth/login" className="text-sm text-center text-primary underline underline-offset-4">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
