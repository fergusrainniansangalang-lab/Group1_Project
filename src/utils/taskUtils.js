// @file    taskUtils.js
// @folder  src/utils/
// @about   Pure utility functions for filtering and aggregating posts/tasks.
//
// What this file does:
// - filterPosts()      — filters the posts array by tab (All/Pending/Completed) and keyword.
// - calculateStats()   — returns { total, pending, completed } counts from a posts array.
// - Used by FilterTabs, TaskStats, and HomeScreen without any side effects.

export const taskUtils = {
  filterPosts: (posts, filter, searchQuery) => {
    return posts.filter(post => {
      const matchesFilter =
        filter === 'All' ? true :
        filter === 'Completed' ? post.completed :
        filter === 'Pending' ? !post.completed :
        post.category === filter;

      const matchesSearch =
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  },
  calculateStats: (posts) => {
    const total = posts.length;
    const completed = posts.filter(p => p.completed).length;
    const pending = total - completed;
    const totalReactions = posts.reduce((acc, p) => {
      return acc + Object.values(p.reactions).reduce((a, b) => a + b, 0);
    }, 0);
    return { total, completed, pending, totalReactions };
  }
};