import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Button } from '../../src/components/common/Button';

describe('Button', () => {
  it('renders with title', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(<Button title="Submit" />);
    });
    const json = tree!.toJSON();
    expect(json).toBeTruthy();
  });

  it('renders disabled when disabled prop is true', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(<Button title="Submit" disabled />);
    });
    expect(tree!.toJSON()).toBeTruthy();
  });

  it('renders loading state', () => {
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(<Button title="Submit" loading />);
    });
    expect(tree!.toJSON()).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(<Button title="Submit" onPress={onPress} />);
    });
    const touchable = tree!.root.findByType(require('react-native').TouchableOpacity);
    act(() => {
      touchable.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('sets disabled on TouchableOpacity when disabled prop is true', () => {
    const onPress = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer | null = null;
    act(() => {
      tree = ReactTestRenderer.create(
        <Button title="Submit" onPress={onPress} disabled />
      );
    });
    const touchable = tree!.root.findByType(require('react-native').TouchableOpacity);
    expect(touchable.props.disabled).toBe(true);
  });
});
