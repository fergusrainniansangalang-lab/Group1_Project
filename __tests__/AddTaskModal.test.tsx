import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Modal = ({ children, visible }: any) => (visible ? children : null);
  return RN;
});

jest.mock('../src/utils/imagePickerHelper', () => ({
  pickImageFromGallery: jest.fn(() =>
    Promise.resolve({ uri: 'file://test-pic.jpg', fileName: 'test-pic.jpg' })
  ),
  takePhotoWithCamera: jest.fn(() =>
    Promise.resolve({ uri: 'file://camera-pic.jpg', fileName: 'camera-pic.jpg' })
  ),
}));

import { AddTaskModal as _AddTaskModal } from '../src/components/modals/AddTaskModal';

type AddTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (post: any) => void;
  postToEdit?: any;
  isDark?: boolean;
  user?: { name: string; avatar: string };
};

const AddTaskModal = _AddTaskModal as React.FC<AddTaskModalProps>;

describe('AddTaskModal', () => {
  it('renders correctly with image attachment options', async () => {
    const handleClose = jest.fn();
    const handleAddPost = jest.fn();

    let tree: any;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AddTaskModal
          isOpen={true}
          onClose={handleClose}
          onAddPost={handleAddPost}
          isDark={true}
          user={{ name: 'Alex Morgan', avatar: 'https://example.com/avatar.jpg' }}
        />
      );
    });

    expect(tree.toJSON()).toBeTruthy();
  });
});
