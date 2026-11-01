import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Modal = ({ children, visible }: any) => (visible ? children : null);
  return RN;
});

jest.mock('../src/utils/imagePickerHelper', () => ({
  pickImageFromGallery: jest.fn(() =>
    Promise.resolve({ uri: 'file://sample-image.jpg', fileName: 'sample-image.jpg' })
  ),
  takePhotoWithCamera: jest.fn(() =>
    Promise.resolve({ uri: 'file://camera-image.jpg', fileName: 'camera-image.jpg' })
  ),
}));

import { FacebookCreateUser } from '../src/components/common/FacebookCreateUser';

describe('FacebookCreateUser', () => {
  it('renders correctly when open', async () => {
    const handleClose = jest.fn();
    const handleSignUp = jest.fn();

    let tree: any;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <FacebookCreateUser
          isOpen={true}
          onClose={handleClose}
          onSignUp={handleSignUp}
          isDark={true}
        />
      );
    });

    expect(tree.toJSON()).toBeTruthy();
  });
});
