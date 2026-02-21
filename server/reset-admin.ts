import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_BACKEND_SECRET =
  process.env.SUPABASE_BACKEND_SECRET || "admin-backend-secret-8829";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

// Add the custom header to bypass RLS if policies are set up to check it
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  global: {
    headers: {
      "x-backend-secret": SUPABASE_BACKEND_SECRET,
    },
  },
});

async function resetAdmin() {
  console.log("Connecting to Supabase...");

  // First, just list what exists
  const { data: rows, error } = await supabase
    .from("admin_credentials")
    .select("*");

  if (error) {
    console.error("Error fetching rows:", error);
    return;
  }

  console.log(`Found ${rows?.length} custom admin records.`);

  if (rows && rows.length > 0) {
    for (const row of rows) {
      console.log(`Deleting record: ${row.adminEmail} (ID: ${row.id})`);
      const { error: delErr } = await supabase
        .from("admin_credentials")
        .delete()
        .eq("id", row.id);
      if (delErr) console.error("Error deleting:", delErr);
      else console.log("Deleted successfully.");
    }
  } else {
    console.log(
      "Table is empty. Verify that 'admin_credentials' table exists and RLS allows reading.",
    );
  }

  // Also explicitly verify the default flow would work by mimicking the check
  console.log("Verifying default logic simulation...");
  const { data: countCheck } = await supabase
    .from("admin_credentials")
    .select("id")
    .eq("is_active", true);
  if (!countCheck || countCheck.length === 0) {
    console.log(
      "✅ No active custom admins found. Default credentials SHOULD work.",
    );
  } else {
    console.log("❌ Active custom admins still exist!");
  }
}

resetAdmin();
