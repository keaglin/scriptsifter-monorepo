import { createClient } from "@/services/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  console.log('requestUrl origin', requestUrl.origin);

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();

  // URL to redirect to after sign out process completes
  return NextResponse.redirect('/');
}
