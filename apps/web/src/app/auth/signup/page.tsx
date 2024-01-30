import { createClient } from "@/services/supabase/server";
import { headers, cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Signup({
	searchParams,
}: {
	searchParams: { message: string };
}) {
	const signUp = async (formData: FormData) => {
		"use server";

		const origin = headers().get("origin");
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const cookieStore = cookies();
		const supabase = createClient(cookieStore);

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${origin}/auth/callback`,
			},
		});

		if (error) {
			return redirect("/auth/signin?message=Could not authenticate user");
		}

		return redirect("/auth/signin?message=Check email to continue sign in process");
	};
	return (
		<div className="card-body">
			<h1 className="text-center text-4xl mb-6">Sign Up</h1>

			<form method="POST" action={signUp}>
				<div className="form-control">
					<input
						autoComplete="username"
						id="email"
						name="email"
						className="input text-center"
						type="email"
						placeholder="email"
						required
					/>

					<input
						id="password"
						name="password"
						className="input text-center mt-2"
						type="password"
						placeholder="enter password"
						required
					/>

					<input
						id="passwordConfirm"
						name="passwordConfirm"
						className="input text-center mt-2"
						type="password"
						placeholder="confirm password"
						required
					/>
				</div>

				<div className="form-control mt-4 mb-4">
					<button type="submit" className="btn btn-primary">
						Sign Up
					</button>
				</div>

				<div className="text-sm text-secondary text-center">
					<Link className="link no-underline" href="/auth/signin">
						Already have an account? Sign-In
					</Link>
				</div>
				{searchParams?.message && (
					<p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">
						{searchParams.message}
					</p>
				)}
			</form>
		</div>
	);
}
