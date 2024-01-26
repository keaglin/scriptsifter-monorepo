export default function Auth() {
    return (<div className='card-body'>
		<h1 className='text-center text-4xl mb-8'>Send invite link</h1>
	
		{/* {#if form?.error}
			<div in:fade class='alert alert-error shadow-lg'>
				<div>
					<!-- <FrownIcon /> -->
					<span>{form?.error}</span>
				</div>
			</div>
		{/if} */}
	
		<form
			method='POST'
			action='/auth?/invite'
		>
			<div className='form-control'>
				<label htmlFor='email' className='label'>
					<span className='label-text'>Email</span>
				</label>
				<input
					autoComplete='username'
					id='email'
					name='email'
					//value={form?.values?.email ?? ''}
					className='input input-bordered'
					type='email'
					placeholder='email'
					required
				/>
			</div>
		
			<div className='form-control mt-6'>
				<button className='btn btn-primary'>Invite</button>
			</div>
		</form>
	</div>)
}