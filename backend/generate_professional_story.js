const axios = require('axios');
const mongoose = require('mongoose');
const Story = require('./models/Story');
const crypto = require('crypto');

// ─────────────────────────────────────────────────────────────────────────────
// TOONVAULT MANHWA ENGINE v1 — story_engine.config.json
// Model: runware:100@1 | 704x1024 | 28 steps | CFG 7
// ─────────────────────────────────────────────────────────────────────────────
const CONFIG = require('./story_engine.config.json');
const MONGO_URI = 'mongodb://mongo:27017/toonvault';

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  EDIT THIS SECTION TO CREATE YOUR OWN STORY
// ─────────────────────────────────────────────────────────────────────────────
const STORY = {
  title: "My Professor, My Heart",
  genre: "Romance",
  description: "Yuna enrolled in her dream university never expecting to fall for the coldest, most brilliant professor on campus — the very man who swore he'd never feel again.",
  coverBg: "#0d0a1a",
  coverIcon: "📚",
  views: 2800000,
  rating: 4.9,
  likes: 540000,
};

const EPISODES = [
  {
    number: 1,
    title: "Episode 1 — First Lecture",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful university lecture hall, wide establishing shot, rows of students, autumn golden light through tall windows, dreamy academic atmosphere, 8k",
        speaker: "Narration",
        text: "I thought university would be a fresh start. I didn't expect it to change everything."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful Korean girl with large bright eyes and shoulder-length wavy hair, wearing a beige cardigan, clutching books nervously in a hallway, warm campus lighting, hopeful expression, 8k",
        speaker: "Narration",
        text: "I was late to the first lecture. The worst possible first impression."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, dramatic moment, a tall handsome professor in his 30s turning around sharply as a door bursts open, sharp intelligent eyes, dark hair, fitted charcoal blazer, commanding presence, cold but striking, 8k webtoon art",
        speaker: "Narration",
        text: "He didn't yell. He just looked at me — and somehow, that was worse."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, close-up of professor's cold piercing eyes staring down at a nervous girl, his expression unreadable, dramatic lighting, tension palpable, 8k manhwa illustration",
        speaker: "Professor Seo",
        text: "You have thirty seconds to find a seat before I mark you absent for the semester."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, beautiful girl hurrying to the last empty seat, cheeks flushed pink with embarrassment, classmates staring, warm lecture hall light, vibrant webtoon colors, 8k",
        speaker: "Yuna",
        text: "I hated him instantly. Naturally."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, professor writing on a sleek digital board, from behind the beautiful girl watching him intently from her seat, silhouetted classroom, the light catches his profile perfectly, 8k",
        speaker: "Narration",
        text: "But when he spoke about literature — his voice changed. Something in it ached."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, after class, beautiful girl packing up her bag alone, professor standing at his desk, their eyes meeting accidentally across the empty room, charged silence, golden late afternoon light, 8k",
        speaker: "Narration",
        text: "He looked away first. I should have, too."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, exterior campus shot, girl sitting alone under an autumn tree, golden falling leaves, reading a thick novel, peaceful melancholy, warm bokeh light, cinematic vertical panel, 8k",
        speaker: "Narration",
        text: "I stayed up that night reading everything he'd ever published. I told myself it was for class."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, dramatic night scene, professor alone in his office lit by a single lamp, staring out the window at the campus lights, a faint troubled reflection visible, quiet loneliness, 8k webtoon art",
        speaker: "Narration",
        text: "I didn't know then that he was also awake. Also thinking."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, romantic tension, professor and girl accidentally reaching for the same book in the campus library, their hands almost touching, both frozen, warm library light, shelves of books surrounding them, 8k",
        speaker: "Narration",
        text: "The second time our eyes met — I knew I was in trouble."
      }
    ]
  },
  {
    number: 2,
    title: "Episode 2 — The Rule",
    panels: [
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, morning campus cafe, girl stirring coffee at a window table, autumn leaves falling outside, warm russet tones, reflective mood, 8k webtoon illustration",
        speaker: "Narration",
        text: "There is a rule. A very clear rule. Students and professors do not cross that line."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, professor striding across campus in a coat, wind in his hair, other students watching in awe, girl watching from a distance half-hidden by a pillar, yearning expression, 8k",
        speaker: "Yuna",
        text: "I repeated the rule to myself every morning. It didn't help."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, intimate moment, professor and student accidentally sheltering from heavy rain under the same small overhang, physically close, tension, both looking straight ahead stubbornly, rain bokeh, 8k",
        speaker: "Professor Seo",
        text: "Don't read into this. I simply don't want to get wet."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, girl trying not to laugh, professor maintaining strict serious expression but the corner of his mouth twitches, their arms almost touching, rain pouring around them, warm and intimate, 8k",
        speaker: "Yuna",
        text: "\"Of course, Professor.\" But I caught it — the almost-smile."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, close-up of a graded essay being handed back, a perfect score written in red, a tiny handwritten note at the bottom: 'Surprisingly insightful', girl staring at it in disbelief, 8k manhwa detail",
        speaker: "Narration",
        text: "Surprisingly insightful. Highest praise from a man who gave none."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, professor's private office after hours, he is alone reading her essay again, expression unguarded, almost soft, a conflict visible in his eyes, warm lamplight, cinematic, 8k",
        speaker: "Narration",
        text: "He read it twice. She would never know."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, girl and professor at a university garden path, she asks him something boldly, he stops walking, surprised expression for the first time, cherry blossoms despite autumn, magical realist webtoon style, 8k",
        speaker: "Yuna",
        text: "\"Do you ever regret becoming a professor?\" I don't know why I asked."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, professor looking at the girl with a long unreadable gaze, then turning to look at the horizon, the most honest expression he's worn, bittersweet, golden light, 8k",
        speaker: "Professor Seo",
        text: "Every day. And not once."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, two silhouettes walking side by side on a lit campus path at dusk, keeping proper distance but their shadows touching on the ground, beautiful cinematic composition, 8k",
        speaker: "Narration",
        text: "Rules exist because feelings don't care about consequences."
      },
      {
        prompt: "masterpiece, ultra-detailed Korean manhwa webtoon art, girl alone in her dorm room at night, sitting at her desk, staring at a blank page, his name almost written and then erased, warm emotional mood, 8k webtoon art",
        speaker: "Narration",
        text: "I was falling. And I knew, with perfect clarity, that I could not stop."
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────

async function generateWithRunware(panels) {
  const apiKey = process.env.RUNWARE_API_KEY || CONFIG.engine.apiKey;
  const tasks = [
    { taskType: "authentication", apiKey: apiKey },
    ...panels.map(panel => ({
      taskType: "imageInference",
      taskUUID: crypto.randomUUID(),
      model: CONFIG.engine.model,
      positivePrompt: `${CONFIG.storyDefaults.basePositivePrompt}, ${panel.prompt}`,
      negativePrompt: CONFIG.imageSettings.negativePrompt,
      width: CONFIG.imageSettings.width,
      height: CONFIG.imageSettings.height,
      numberResults: CONFIG.imageSettings.numberResults,
      outputFormat: CONFIG.imageSettings.outputFormat,
      CFGScale: CONFIG.imageSettings.CFGScale,
      steps: CONFIG.imageSettings.steps
    }))
  ];

  const resp = await axios.post(CONFIG.engine.apiEndpoint, tasks, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000
  });

  if (resp.data.errors?.length) throw new Error(JSON.stringify(resp.data.errors[0]));

  return resp.data.data
    .filter(d => d.taskType === "imageInference")
    .map(d => d.imageURL);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ MongoDB connected');
    console.log(`\n🎨 ToonVault Manhwa Engine v1 — Generating "${STORY.title}"`);
    console.log(`   Model: ${CONFIG.engine.model} | ${CONFIG.imageSettings.width}x${CONFIG.imageSettings.height} | ${CONFIG.imageSettings.steps} steps\n`);

    const allEpisodes = [];

    for (const ep of EPISODES) {
      console.log(`━━━ ${ep.title} (${ep.panels.length} panels) ━━━`);
      const imageUrls = await generateWithRunware(ep.panels);
      console.log(`✅ ${imageUrls.length} images generated`);

      const contentArr = ep.panels.map((p, i) => ({
        speaker: p.speaker,
        text: p.text,
        imageUrl: imageUrls[i] || ''
      }));

      allEpisodes.push({
        number: ep.number,
        title: ep.title,
        panels: imageUrls,
        content: JSON.stringify(contentArr),
        createdAt: new Date(Date.now() + ep.number * 86400000)
      });
    }

    const newStory = new Story({
      title: STORY.title,
      genre: STORY.genre,
      coverIcon: STORY.coverIcon,
      coverBg: STORY.coverBg,
      authorId: "admin",
      authorName: "Master Architect",
      views: STORY.views,
      rating: STORY.rating,
      likes: STORY.likes,
      status: "Live",
      type: "Comic",
      description: STORY.description,
      panels: allEpisodes[0].panels,
      content: allEpisodes[0].content,
      episodes: allEpisodes
    });

    await newStory.save();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ "${STORY.title}" — ${allEpisodes.length} episodes created!`);
    console.log(`📖 Story ID: ${newStory._id}`);
    console.log(`🔗 Story Page: https://toonvault.com/story/${newStory._id}`);
    console.log(`▶️  Episode 1:  https://toonvault.com/manta/${newStory._id}?ep=1`);
    console.log(`▶️  Episode 2:  https://toonvault.com/manta/${newStory._id}?ep=2`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
    process.exit(1);
  }
}

run();
