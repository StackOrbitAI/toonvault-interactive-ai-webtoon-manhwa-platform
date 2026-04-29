const axios = require('axios');
const fs = require('fs');

const API_BASE = 'http://localhost:5000'; // Internal docker port
const ADMIN_TOKEN = 'DEMO_TOKEN'; // We might need a real token

const TOPICS = [
    "A secret heir to a fallen kingdom",
    "A girl who can see the red strings of fate",
    "The villain who fell in love with the heroine's sister",
    "A cyberpunk world where dreams are traded as currency",
    "A ghost who helps a detective solve their own murder",
    "The last dragon in a world of machines",
    "A romance between a sun deity and a moon priestess",
    "A gladiator who fights with magic ink",
    "A time traveler who keeps meeting the same person in different eras",
    "A cursed forest where every tree is a person",
    "A futuristic academy for AI-human hybrids",
    "A high society scandal involving a forbidden magic",
    "The shadow of a great hero trying to become real",
    "A merchant who sells memories of a lost world",
    "A sword that talks too much and its reluctant wielder"
];

async function generate() {
    console.log("Starting bulk story generation...");
    
    // We need a valid token. Since this runs on the VPS, we can bypass auth if we want,
    // but the easiest is to use the existing admin or demo user.
    // I'll use the /api/auth/login to get a token if needed, or assume we have one.
    
    for (const topic of TOPICS) {
        try {
            console.log(`Generating story: ${topic}...`);
            // We'll use a local request to the backend service
            // Note: We need a valid User ID in the token
            // For now, I'll assume the backend allows a specific "SEEDED" user or similar
            // Actually, I'll just skip the script and use run_command with curl if possible, 
            // but a script is better for error handling.
        } catch (e) {
            console.error(`Failed to generate ${topic}:`, e.message);
        }
    }
}
