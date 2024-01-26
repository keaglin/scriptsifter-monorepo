export default function MagicLink() {
    return (<div className='card-body'>
		<h1 className='text-center text-4xl mb-6'>Forgot password?</h1>

		<form
			method='POST'
			action='/auth?/magiclink'
		>
			<div className='form-control'>
				<input
					autoComplete='username'
					id='email'
					name='email'
					className='input text-center'
					type='email'
					placeholder='email'
					required
				/>
			</div>

			<div className='form-control mt-4'>
				<button className='btn btn-primary'>SEND RESET LINK</button>
			</div>
		</form>
	</div>)
}