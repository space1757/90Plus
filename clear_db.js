/**
 * Supabase Database Cleaner Utility for 90Plus
 * 
 * Run this script to delete all news articles and match results from the database:
 * node clear_db.js
 */

const supabaseUrl = 'https://ayxqmsdctmaehahvrmra.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eHFtc2RjdG1hZWhhaHZybXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDIyNzYsImV4cCI6MjA5NTI3ODI3Nn0.ff00_U_nJx4s-HBboLGoIJIUrNL1vtgHht3PAjJ2yyc';

async function clearDatabase() {
    console.log("🧹 Starting database cleanup...");
    console.log("Connecting to:", supabaseUrl);
    
    try {
        const response = await fetch(`${supabaseUrl}/rest/v1/football_news?id=neq.0`, {
            method: 'DELETE',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });
        
        if (response.ok) {
            console.log("✅ Successfully deleted all news articles and match results from the database!");
            console.log("Status:", response.status);
        } else {
            const body = await response.text();
            console.error("❌ Failed to clear database. Server responded with:", response.status, body);
        }
    } catch (error) {
        console.error("❌ Network or Connection error: ", error.message);
        console.log("\n💡 Note: If you receive a connection error, please check if your Supabase project is currently paused.");
        console.log("You can unpause it from the Supabase Dashboard: https://supabase.com/dashboard");
    }
}

clearDatabase();
