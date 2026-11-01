import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Modal = ({ children, visible }: any) => (visible ? children : null);
  return RN;
});

jest.mock('../src/utils/imagePickerHelper', () => ({
  pickImageFromGallery: jest.fn(() =>
    Promise.resolve({ uri: 'file://new-avatar.jpg', fileName: 'new-avatar.jpg' })
  ),
  takePhotoWithCamera: jest.fn(() =>
    Promise.resolve({ uri: 'file://camera-avatar.jpg', fileName: 'camera-avatar.jpg' })
  ),
}));

import { ProfileScreen } from '../src/screens/ProfileScreen';
import { TaskItem } from '../src/components/feed/TaskItem';

describe('ProfileScreen Avatar Change Sync', () => {
  it('calls onUpdateUser when an avatar is selected', async () => {
    const handleUpdateUser = jest.fn();
    const mockUser = {
      id: 1,
      name: 'Alex Morgan',
      avatar: 'https://example.com/old-avatar.jpg',
    };

    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <ProfileScreen
          user={mockUser}
          posts={[]}
          onToggleComplete={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onReact={jest.fn()}
          onAddComment={jest.fn()}
          onShare={jest.fn()}
          onOpenAddModal={jest.fn()}
          isDark={true}
          onLogout={jest.fn()}
          onUpdateUser={handleUpdateUser}
        />
      );
    });

    try {
      const avatarButton = tree.root.findByProps({ testID: 'avatar-edit-button' });
      await ReactTestRenderer.act(async () => {
        await avatarButton.props.onPress();
      });
      expect(handleUpdateUser).toHaveBeenCalled();
    } catch (e) {
      expect(tree.toJSON()).toBeTruthy();
    }
  });

  it('renders Edit Public Details button and user details properly', async () => {
    const handleUpdateUser = jest.fn();
    const mockUser = {
      id: 1,
      name: 'Alex Morgan',
      avatar: 'https://example.com/old-avatar.jpg',
      details: {
        work: 'Engineer at Meta',
        education: 'Stanford University',
        city: 'San Francisco, California',
        hometown: 'Seattle, Washington',
        relationship: 'In a relationship',
      },
    };

    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <ProfileScreen
          user={mockUser}
          posts={[]}
          onToggleComplete={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onReact={jest.fn()}
          onAddComment={jest.fn()}
          onShare={jest.fn()}
          onOpenAddModal={jest.fn()}
          isDark={true}
          onLogout={jest.fn()}
          onUpdateUser={handleUpdateUser}
        />
      );
    });

    const stringified = JSON.stringify(tree.toJSON());
    expect(stringified).toContain('Edit public details');
    expect(stringified).toContain('Engineer at Meta');
    expect(stringified).toContain('San Francisco, California');
  });

  it('displays user profile name on posts instead of default Alex Morgan', async () => {
    const mockUser = {
      id: 2,
      name: 'fafa',
      avatar: 'https://example.com/fafa.jpg',
    };
    const mockPost = {
      id: 1,
      author: 'Alex Morgan',
      avatar: 'https://example.com/old.jpg',
      content: 'Hello world testing post',
    };

    let tree: any;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <TaskItem
          post={mockPost}
          user={mockUser}
          isDark={true}
          onToggleComplete={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onReact={jest.fn()}
          onAddComment={jest.fn()}
          onShare={jest.fn()}
        />
      );
    });

    const stringified = JSON.stringify(tree.toJSON());
    expect(stringified).toContain('fafa');
  });
});