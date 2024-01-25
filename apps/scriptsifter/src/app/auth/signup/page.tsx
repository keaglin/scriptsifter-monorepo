export default function Auth() {
	return (
		<div className="card-body">
			<h1 className="text-center text-4xl mb-6">Sign Up</h1>

			<form method="POST" action="/auth/signup">
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
					<a className="link no-underline" href="?signin">
						Already have an account? Sign-In
					</a>
				</div>
			</form>
		</div>
	);
}
