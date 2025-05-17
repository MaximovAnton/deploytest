import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('date')
      .order('date', { ascending: true }); // необязательно, но удобно

    if (error) {
      console.error('❌ Error fetching dates:', error.message);
      return res.status(500).json({ error: error.message });
    }

    const dates = data.map((item) => item.date);
    return res.status(200).json(dates);
  } catch (err) {
    console.error('❌ Uncaught error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
