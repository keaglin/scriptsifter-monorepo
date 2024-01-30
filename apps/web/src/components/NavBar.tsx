import Link from 'next/link';
import AuthButton from './AuthButton';

export default function NavBar() {

  return (
    <header style={{
      //width: '100%',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around'
    }}>
      <Link href='/'>Home</Link>
      <Link href='/dashboard'>Dashboard</Link>
      <Link href='/upload'>Upload</Link>
      <AuthButton />
    </header>
  )
}
