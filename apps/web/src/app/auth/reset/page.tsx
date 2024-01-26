export default function Auth() {
    return (<div className='card-body'>
		<h1 className='text-center text-4xl mb-6'>Reset password</h1>
	
		<form
			method='POST'
			action='/auth?/reset'
		>
			<div className='form-control'>
				<input
					id='password'
					name='password'
					className='input text-center mt-2'
					type='password'
					placeholder='enter password'
					required
				/>
	
				<input
					id='password'
					name='password'
					className='input text-center mt-2'
					type='password'
					placeholder='confirm password'
					required
				/>
	
				<div className='form-control mt-6'>
					<button className='btn btn-primary'>Reset Password</button>
				</div>
			</div>
		</form>
	</div>)
}