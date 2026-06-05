const axios = require('axios');
const mongoose = require('mongoose');
const Story = require('./models/Story');
const crypto = require('crypto');
require('dotenv').config();

const MONGO_URI = 'mongodb://mongo:27017/toonvault';
const RUNWARE_KEY = process.env.RUNWARE_API_KEY || "YOUR_RUNWARE_API_KEY";
const STORY_ID = "6a22ea4f1dc0500d7f5bc596";

// ─────────────────────────────────────────────────────────────────────────────
// EPISODE DEFINITIONS — Each episode has panels with AI prompts + narrative quotes
// ─────────────────────────────────────────────────────────────────────────────

const EPISODES_DATA = [
  {
    number: 1,
    title: "Episode 1 — The Arrangement",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful Korean woman with large expressive eyes and long black hair, wearing a white blouse, standing by a rain-streaked glass window overlooking glowing Seoul cityscape at night, melancholic mood, teal and rose cinematic lighting, clean linework, vibrant webtoon colors, 8k",
        speaker: "Narration",
        text: "Some choices follow you like shadows... even when you think you've outrun them."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, tall handsome Korean man with sharp cold features, swept-back dark hair, perfect tailored dark suit, arms folded, standing silhouetted against a floor-to-ceiling office window, Seoul skyline glittering behind him, dramatic blue rim lighting, webtoon illustration style, 8k",
        speaker: "Narration",
        text: "Kang Jiwoo. Korea's most powerful CEO. And apparently... my husband-to-be."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, close-up of a sleek legal contract document on a polished dark wood desk, a woman's slender hand next to unsigned papers, a man's strong hand sliding the contract forward, warm desk lamp light, suspenseful tension, high contrast shadows, 8k webtoon illustration",
        speaker: "Jiwoo",
        text: "It's simple. A contract. Two years. No feelings. Just convenience."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful Korean woman looking wide-eyed and vulnerable, facing a tall stoic man in a grand marble lobby, polished floors reflecting neon light, cold distance between them, soft pink and blue cinematic glow, emotional tension, 8k webtoon illustration",
        speaker: "Hana",
        text: "And if I refuse? He turned away. \"You won't.\""
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful woman in a stunning white wedding gown sitting alone at a vanity mirror, tearful eyes, rose petals on the floor, warm backlit golden light, bittersweet emotion, soft bokeh, cinematic vertical composition, 8k",
        speaker: "Narration",
        text: "I told myself I was doing it for my family. I lied."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, dramatic wedding ceremony, handsome cold groom and beautiful emotional bride facing each other at an altar, golden sunset light through cathedral windows, intense eye contact, unspoken tension, wide cinematic shot, 8k webtoon art",
        speaker: "Narration",
        text: "\"Do you take this man...\" The priest's words felt distant. All I could see were his eyes."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful woman arriving at a massive modern penthouse, overwhelmed and lonely, wide shot of huge minimalist interior, city lights visible through floor-to-ceiling windows, man walking away into the distance, emotional contrast, 8k webtoon style",
        speaker: "Narration",
        text: "Our first night as husband and wife. He went to his study without a word."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, woman standing in a dark hallway staring at a closed door with warm light peeking underneath, curious and lonely expression, dramatic low-key lighting, cinematic atmosphere, fine linework, 8k",
        speaker: "Narration",
        text: "Behind every cold wall is a story. I was starting to wonder what his was."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, dramatic moment, a tall man at a doorway catching a woman in his private study looking at an old photograph, both frozen, genuine surprise and raw vulnerability on both faces, warm lamp glow, intimate midnight atmosphere, 8k webtoon art",
        speaker: "Hana",
        text: "\"Who is she?\" I whispered. His jaw tightened. \"No one you need to know.\""
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, romantic rooftop scene, a woman and a man standing side by side on a penthouse terrace at night, Seoul skyline glittering below, their hands almost touching on the railing, unresolved tension, starry sky, warm city lights bokeh, cinematic wide composition, 8k",
        speaker: "Narration",
        text: "Two years, he had said. But standing there beside him, two years felt dangerously short."
      }
    ]
  },
  {
    number: 2,
    title: "Episode 2 — The Cold Morning",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, soft morning light in a luxury penthouse kitchen, beautiful woman making coffee alone, wearing a soft robe, pale sunrise glow, melancholic peaceful mood, 8k",
        speaker: "Narration",
        text: "I woke up before him. I think I always will."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, handsome cold CEO man appearing in the kitchen doorway, business suit already on at 6am, cold expressionless face, woman startled, warm morning light contrast, 8k webtoon art",
        speaker: "Jiwoo",
        text: "Don't cook for me. I eat at the office."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, woman alone at a long dining table eating breakfast, one seat at the head left empty, the whole room feeling vast and hollow, quiet loneliness, dramatic composition, 8k",
        speaker: "Narration",
        text: "The table had twelve chairs. I always sat at the wrong end."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, a phone ringing on a marble counter, the screen showing 'Mother', woman staring at it with a conflicted look, backlit by window light, emotional weight, 8k webtoon illustration",
        speaker: "Narration",
        text: "She'd ask if I was happy. I'd say I was fine. We'd both know I was lying."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, dramatic close-up of man's cold profile in a sleek black car, city blurring outside the window, a single thought haunting his expression, cinematic, 8k",
        speaker: "Jiwoo",
        text: "She looked at me differently this morning. I don't know what to do with that."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful woman exploring a grand private study lined with bookshelves, pulling out an old leather-bound book, dust motes in a beam of light, curious and reverent, warm tones, 8k webtoon art",
        speaker: "Narration",
        text: "His books were underlined. Someone who underlines must still believe words matter."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, woman discovering a framed old photo hidden behind books, black and white photo of a laughing young man — the same CEO but softer, happier, shocked expression on her face, dramatic reveal lighting, 8k",
        speaker: "Narration",
        text: "He used to smile. Someone took that from him."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, CEO returning home late at night, tie loosened, catching the woman asleep on a couch with a book in her lap, he stops — something shifts in his cold eyes, soft lamp glow, intimate quiet, 8k webtoon art",
        speaker: "Narration",
        text: "He stood there longer than he needed to. I know, because I wasn't really asleep."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, man gently placing a blanket over a sleeping woman on a couch, his face close, a rare unguarded tenderness visible for just a moment, candlelight warm tones, beautiful intimate scene, 8k",
        speaker: "Narration",
        text: "A small kindness from a man who claimed to feel nothing."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, woman waking up to find a single white flower placed on the coffee table, the room empty, morning light, she stares at it with wonder and the beginning of something she can't name, 8k webtoon art",
        speaker: "Narration",
        text: "He left no note. He never does. But the flower said everything."
      }
    ]
  }
];

// Build story map entries for StoryMap visualization
function buildStoryMapNodes(episodes) {
  const nodes = [];
  let nodeId = 1;
  
  episodes.forEach((ep, epIdx) => {
    ep.panels.forEach((panel, pIdx) => {
      nodes.push({
        id: `ep${ep.number}_panel${pIdx + 1}`,
        label: `Ep${ep.number} · Scene ${pIdx + 1}`,
        episode: ep.number,
        panelIndex: pIdx,
        quote: panel.text,
        speaker: panel.speaker,
        x: epIdx * 300 + 100,
        y: pIdx * 120 + 80,
        type: pIdx === ep.panels.length - 1 ? 'climax' : 'normal'
      });
    });
    // Add episode connector node
    if (epIdx < episodes.length - 1) {
      nodes.push({
        id: `bridge_ep${ep.number}_ep${ep.number + 1}`,
        label: `→ Episode ${ep.number + 1}`,
        type: 'bridge',
        episode: ep.number,
        x: epIdx * 300 + 200,
        y: ep.panels.length * 120 / 2
      });
    }
  });
  
  return nodes;
}

async function generateEpisodeImages(episodeData) {
  console.log(`\n🎨 Generating ${episodeData.panels.length} panels for "${episodeData.title}"...`);
  
  const runwareTasks = [
    { taskType: "authentication", apiKey: RUNWARE_KEY },
    ...episodeData.panels.map((panel) => ({
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      model: "runware:100@1",
      positivePrompt: panel.prompt,
      negativePrompt: "blurry, low quality, distorted, bad anatomy, extra limbs, watermark, text, logo, nsfw, ugly, deformed",
      width: 704,
      height: 1024,
      numberResults: 1,
      outputFormat: "WEBP",
      CFGScale: 7,
      steps: 28
    }))
  ];

  const runwareResp = await axios.post('https://api.runware.ai/v1', runwareTasks, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000
  });

  if (runwareResp.data.errors?.length) {
    throw new Error("Runware errors: " + JSON.stringify(runwareResp.data.errors.slice(0,2)));
  }

  const imageUrls = runwareResp.data.data
    .filter(d => d.taskType === "imageInference")
    .map(d => d.imageURL);

  console.log(`✅ Generated ${imageUrls.length} images for "${episodeData.title}"`);
  return imageUrls;
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB');

    const story = await Story.findById(STORY_ID);
    if (!story) throw new Error(`Story ${STORY_ID} not found`);
    console.log(`📖 Found story: "${story.title}"`);

    const updatedEpisodes = [];

    for (const epData of EPISODES_DATA) {
      console.log(`\n━━━ Processing ${epData.title} ━━━`);
      
      const imageUrls = await generateEpisodeImages(epData);
      
      const contentArr = epData.panels.map((panel, i) => ({
        speaker: panel.speaker,
        text: panel.text,
        imageUrl: imageUrls[i] || ''
      }));

      updatedEpisodes.push({
        number: epData.number,
        title: epData.title,
        panels: imageUrls,
        content: JSON.stringify(contentArr),
        createdAt: new Date(Date.now() + epData.number * 86400000)
      });
    }

    // Build storymap metadata
    const storyMapNodes = buildStoryMapNodes(EPISODES_DATA);

    // Update the story with all episodes + storymap
    story.episodes = updatedEpisodes;
    story.panels = updatedEpisodes[0].panels; // Cover = first episode panels
    story.content = updatedEpisodes[0].content;
    story.storyMapData = JSON.stringify(storyMapNodes);
    story.status = 'Live';
    
    await story.save();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Story updated with ${updatedEpisodes.length} professional episodes!`);
    console.log(`📖 Story ID: ${STORY_ID}`);
    console.log(`🔗 Read Episode 1: https://toonvault.com/manta/${STORY_ID}?ep=1`);
    console.log(`🔗 Read Episode 2: https://toonvault.com/manta/${STORY_ID}?ep=2`);
    console.log(`🗺️  Story Map: https://toonvault.com/story/${STORY_ID} → Quest Map tab`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
