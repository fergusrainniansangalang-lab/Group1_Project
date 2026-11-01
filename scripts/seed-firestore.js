const fs = require('fs');
const path = require('path');

// Read Firebase token from configstore
function getAccessToken() {
  const configPath = path.join(
    process.env.USERPROFILE,
    '.config',
    'configstore',
    'firebase-tools.json'
  );
  if (!fs.existsSync(configPath)) {
    throw new Error('firebase-tools.json not found in ' + configPath);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.tokens?.access_token;
}

const PROJECT_ID = 'harbor-rn-2026';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestoreSetDoc(collectionId, docId, fields, token) {
  const url = `${BASE_URL}/${collectionId}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Error writing ${collectionId}/${docId}:`, res.status, text);
  } else {
    console.log(`✓ Set ${collectionId}/${docId}`);
  }
}

async function firestoreSetSubDoc(parentPath, docId, fields, token) {
  const url = `${BASE_URL}/${parentPath}/${docId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Error writing ${parentPath}/${docId}:`, res.status, text);
  } else {
    console.log(`✓ Set ${parentPath}/${docId}`);
  }
}

async function runSeed() {
  const token = getAccessToken();
  console.log('Seeding Firestore database for project:', PROJECT_ID);

  const now = new Date().toISOString();

  // 1. Seed Users
  const users = [
    {
      id: 'ines',
      name: 'Ines Okafor-Lind',
      handle: 'ines',
      bio: 'Pastry chef and sourdough obsessive. Savoring life in Lisbon.',
      location: 'Lisbon, Portugal',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      followersCount: 342,
      followingCount: 180,
      postsCount: 24,
    },
    {
      id: 'tomasz',
      name: 'Tomasz Wierzbicki',
      handle: 'tomaszw',
      bio: 'Community librarian & cyclist. Maps, zines, and coffee.',
      location: 'Kraków, Poland',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      followersCount: 215,
      followingCount: 94,
      postsCount: 18,
    },
    {
      id: 'priya',
      name: 'Priya Raghunathan',
      handle: 'priya.trails',
      bio: 'Alpine trails, trail runner, wildlife photographer. Up in the Cascades.',
      location: 'North Cascades, WA',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      followersCount: 1420,
      followingCount: 310,
      postsCount: 89,
    },
    {
      id: 'mateo',
      name: 'Mateo Arriaga',
      handle: 'mateo_ceramics',
      bio: 'Ceramics artist & wood-fired kiln builder in Oaxaca.',
      location: 'Oaxaca, Mexico',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      followersCount: 890,
      followingCount: 215,
      postsCount: 45,
    },
    {
      id: 'grok',
      name: 'Harbor Grok',
      handle: 'grok',
      bio: 'Your candid AI companion for news, truth, ideas, and visual creativity.',
      location: 'Everywhere',
      photoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      followersCount: 50000,
      followingCount: 1,
      postsCount: 12,
    },
  ];

  for (const u of users) {
    await firestoreSetDoc(
      'users',
      u.id,
      {
        name: { stringValue: u.name },
        handle: { stringValue: u.handle },
        bio: { stringValue: u.bio },
        location: { stringValue: u.location },
        photoUrl: { stringValue: u.photoUrl },
        followersCount: { integerValue: String(u.followersCount) },
        followingCount: { integerValue: String(u.followingCount) },
        postsCount: { integerValue: String(u.postsCount) },
        createdAt: { timestampValue: now },
        updatedAt: { timestampValue: now },
      },
      token
    );
  }

  // 2. Seed Posts
  const posts = [
    {
      id: 'p1',
      authorId: 'ines',
      text: 'Third attempt at pastéis de nata from scratch and the lamination finally held. Butter ratios are in the comments for everyone who asked.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1080&auto=format&fit=crop&q=80',
      likeCount: 214,
      commentCount: 4,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: 'p2',
      authorId: 'tomasz',
      text: 'Our neighborhood library is extending Saturday hours starting this weekend. If you use the reading room, the survey on the new schedule closes Wednesday!',
      imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1080&auto=format&fit=crop&q=80',
      likeCount: 87,
      commentCount: 2,
      createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
    {
      id: 'p3',
      authorId: 'priya',
      text: 'Maple Pass Loop. 14.3 km, 820 m of gain, and one very judgmental marmot watching from the rocks.',
      imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1080&auto=format&fit=crop&q=80',
      likeCount: 1208,
      commentCount: 6,
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    },
    {
      id: 'p4',
      authorId: 'mateo',
      text: 'The pottery studio is finally done. Six months, one very patient landlord, and more clay dust than I will ever admit to.',
      imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1080&auto=format&fit=crop&q=80',
      likeCount: 356,
      commentCount: 3,
      createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    },
    {
      id: 'p5',
      authorId: 'grok',
      text: 'Harbor Grok update: Autonomous AI agents are building full apps, commercial fusion energy passed another milestone, and humans are still asking why the code works on local but not on prod. What a time to be alive.',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&auto=format&fit=crop&q=80',
      likeCount: 3421,
      commentCount: 8,
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    },
  ];

  for (const p of posts) {
    await firestoreSetDoc(
      'posts',
      p.id,
      {
        authorId: { stringValue: p.authorId },
        text: { stringValue: p.text },
        imageUrl: { stringValue: p.imageUrl },
        likeCount: { integerValue: String(p.likeCount) },
        commentCount: { integerValue: String(p.commentCount) },
        createdAt: { timestampValue: p.createdAt },
      },
      token
    );
  }

  // 3. Seed Comments for p1 and p3
  const comments = [
    {
      post: 'p1',
      id: 'c1',
      authorId: 'mateo',
      text: 'The crust looks unbelievable! What flour protein percentage did you use?',
    },
    {
      post: 'p1',
      id: 'c2',
      authorId: 'priya',
      text: 'Drop the recipe please! Bringing these to the next group hike.',
    },
    {
      post: 'p3',
      id: 'c3',
      authorId: 'ines',
      text: 'The light on the ridgeline is unreal. Beautiful shot Priya!',
    },
    {
      post: 'p5',
      id: 'c4',
      authorId: 'tomasz',
      text: 'Grok never misses with the real talk 😂',
    },
  ];

  for (const c of comments) {
    await firestoreSetSubDoc(
      `posts/${c.post}/comments`,
      c.id,
      {
        authorId: { stringValue: c.authorId },
        text: { stringValue: c.text },
        createdAt: { timestampValue: now },
      },
      token
    );
  }

  console.log('Seeding completed successfully!');
}

runSeed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
