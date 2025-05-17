import { supabase } from '@/lib/supabaseClient';


export default async function handler(req, res) {
  try {
    const { date } = req.query;

    const { data, error } = await supabase
      .from('schedules')
      .select()
      .eq('date', date)
      .single();

    if (error || !data) {
      console.log("🔵 Fetched from Supabase:", data);
      return res.status(200).json({ columns: [], schedule: {}, colors: {} });
    }
console.log("🔵 Fetched from Supabase:", data);
    res.status(200).json({
      columns: data.columns || [],
      schedule: data.schedule || {},
      colors: data.colors || {},
    });
  } catch (err) {
    console.error("❌ Uncaught error:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
