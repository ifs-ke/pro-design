import { SignUp } from "@clerk/nextjs";
 
export default function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const redirect = searchParams.redirect_url;
  // Ensure redirectUrl is a string, taking the first value if it's an array.
  // Default to "/dashboard" if it's not present.
  const redirectUrl = Array.isArray(redirect) ? redirect[0] : redirect || "/dashboard";
 
  return <SignUp afterSignUpUrl={redirectUrl} />;
}
