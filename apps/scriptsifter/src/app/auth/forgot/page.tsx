export default function Auth() {
	return (<div className='card-body'>
		<h1 className='text-center text-4xl mb-6'>Forgot password?</h1>

		<form
			method='POST'
			action='/auth/forgot'
		>
			<div className='form-control'>
				<input
					autoComplete='username'
					id='email'
					name='email'
					//value={form?.values?.email ?? ''}
					className='input text-center'
					type='email'
					placeholder='email'
					required
				/>
			</div>

			<div className='form-control mt-4'>
				<button type="submit" className='btn btn-primary'>SEND RESET LINK</button>
			</div>
		</form>
	</div>)
}
