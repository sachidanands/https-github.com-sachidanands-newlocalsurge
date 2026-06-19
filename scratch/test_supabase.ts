import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  console.log("URL:", supabaseUrl);
  console.log("Key starting with:", supabaseKey ? supabaseKey.substring(0, 10) + "..." : "None");
  if (!supabaseUrl || !supabaseKey) {
    console.log("Missing config");
    return;
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from("leads").select("id").limit(1);
  if (error) {
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
  } else {
    console.log("Success! Data:", data);
  }
}
run();
