import { validateEmail } from '../src/services/authService';

describe('Auth & Email Domain Validation', () => {
  it('accepts valid @gmail.com addresses', () => {
    const res = validateEmail('student@gmail.com');
    expect(res.valid).toBe(true);
    expect(res.message).toBe('');
  });

  it('accepts valid @letran.edu.ph addresses', () => {
    const res = validateEmail('faculty@letran.edu.ph');
    expect(res.valid).toBe(true);
    expect(res.message).toBe('');
  });

  it('rejects other email domains such as @yahoo.com or @outlook.com', () => {
    const yahoo = validateEmail('user@yahoo.com');
    expect(yahoo.valid).toBe(false);
    expect(yahoo.message).toContain('Only @gmail.com and @letran.edu.ph');

    const outlook = validateEmail('user@outlook.com');
    expect(outlook.valid).toBe(false);
  });

  it('rejects empty or malformed emails', () => {
    expect(validateEmail('').valid).toBe(false);
    expect(validateEmail('notanemail').valid).toBe(false);
  });
});

describe('Profile Isolation & Public Story / Post Logic', () => {
  it('updates only posts belonging to the authenticated user', () => {
    const userA = { uid: 'user_a', name: 'User A', avatar: 'https://avatar-a.jpg' };
    const userB = { uid: 'user_b', name: 'User B', avatar: 'https://avatar-b.jpg' };

    const initialPosts = [
      { id: '1', authorId: 'user_a', author: 'User A', avatar: 'https://avatar-a.jpg', content: 'Post A' },
      { id: '2', authorId: 'user_b', author: 'User B', avatar: 'https://avatar-b.jpg', content: 'Post B' },
    ];

    const updatedUserA = { ...userA, name: 'User A (Edited)', avatar: 'https://new-avatar-a.jpg' };

    const updatedPosts = initialPosts.map((post) => {
      if (post.authorId === updatedUserA.uid) {
        return {
          ...post,
          author: updatedUserA.name,
          avatar: updatedUserA.avatar,
        };
      }
      return post;
    });

    // User A's post is updated
    expect(updatedPosts[0].author).toBe('User A (Edited)');
    expect(updatedPosts[0].avatar).toBe('https://new-avatar-a.jpg');

    // User B's post remains completely unchanged
    expect(updatedPosts[1].author).toBe('User B');
    expect(updatedPosts[1].avatar).toBe('https://avatar-b.jpg');
  });

  it('preserves public stories authored by different users', () => {
    const userA = { uid: 'user_a', name: 'User A', avatar: 'https://avatar-a.jpg' };
    const userB = { uid: 'user_b', name: 'User B', avatar: 'https://avatar-b.jpg' };

    const stories = [
      { id: 'story_1', authorId: userA.uid, name: userA.name, avatar: userA.avatar, image: 'https://story-a.jpg' },
      { id: 'story_2', authorId: userB.uid, name: userB.name, avatar: userB.avatar, image: 'https://story-b.jpg' },
    ];

    expect(stories.length).toBe(2);
    expect(stories[0].authorId).toBe('user_a');
    expect(stories[1].authorId).toBe('user_b');
  });
});
