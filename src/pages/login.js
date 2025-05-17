import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🔐 Вход только для своих</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />
        <button type="submit">Войти</button>
      </form>
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
    </div>
  );
}
