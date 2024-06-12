// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ButtonGroup, { ButtonGroupProps } from '../../../lib/components/button-group';
import createWrapper from '../../../lib/components/test-utils/dom';
import TestI18nProvider from '../../../lib/components/i18n/testing';

const i18nMessages = {
  'button-group': {
    'i18nStrings.showMoreButtonAriaLabel': 'Show more',
  },
};

const renderButtonGroup = (props: ButtonGroupProps, ref?: React.Ref<ButtonGroupProps.Ref>) => {
  const renderResult = render(
    <TestI18nProvider messages={i18nMessages}>
      <ButtonGroup ref={ref} {...props} />
    </TestI18nProvider>
  );
  return createWrapper(renderResult.container).findButtonGroup()!;
};

const items1: ButtonGroupProps.ItemOrGroup[] = [
  {
    id: 'feedback',
    text: 'Feedback',
    items: [
      { id: 'like', text: 'Like', iconName: 'thumbs-up', actionPopoverText: 'Liked' },
      { id: 'dislike', text: 'dislike', iconName: 'thumbs-down', actionPopoverText: 'Disliked' },
    ],
  },
  { id: 'copy', iconName: 'copy', text: 'Copy', actionPopoverText: 'Copied' },
  { id: 'edit', iconName: 'edit', text: 'Edit' },
  { id: 'open', iconName: 'file-open', text: 'Open' },
  { id: 'search', iconName: 'search', text: 'Search' },
  {
    id: 'misc',
    text: 'Misc',
    items: [
      { id: 'edit', iconName: 'edit', text: 'Edit' },
      { id: 'open', iconName: 'file-open', text: 'Open' },
      { id: 'upload', iconName: 'upload', text: 'Upload' },
    ],
  },
];

test('renders all items inline when limit=9', () => {
  const wrapper = renderButtonGroup({ items: items1, limit: 9 });

  expect(wrapper.findInlineItems()).toHaveLength(9);
  expect(wrapper.findShowMoreButton()).toBe(null);
});
test('moves misc items to under menu when limit=8', () => {
  const wrapper = renderButtonGroup({ items: items1, limit: 8 });

  expect(wrapper.findInlineItems()).toHaveLength(6);
  expect(wrapper.findShowMoreButton()).not.toBe(null);
});
test('moves misc items and search to under menu when limit=5', () => {
  const wrapper = renderButtonGroup({ items: items1, limit: 5 });

  expect(wrapper.findInlineItems()).toHaveLength(5);
  expect(wrapper.findShowMoreButton()).not.toBe(null);
});
test.each([0, 1])('moves all items to under menu when limit=%s', limit => {
  const wrapper = renderButtonGroup({ items: items1, limit });

  expect(wrapper.findInlineItems()).toHaveLength(0);
  expect(wrapper.findShowMoreButton()).not.toBe(null);
});

test('can find inline item by id', () => {
  const wrapper = renderButtonGroup({ items: items1, limit: 5 });

  expect(wrapper.findInlineItemById('copy')!.getElement()).toHaveAccessibleName('Copy');
});
test('can find menu item by id', () => {
  const wrapper = renderButtonGroup({ items: items1, limit: 5 });

  wrapper.findShowMoreButton()!.openDropdown();

  expect(wrapper.findShowMoreButton()!.findItemById('edit')!.getElement()).toHaveTextContent('Edit');
});

describe('i18n', () => {
  test('uses showMoreButtonAriaLabel from I18nProvider', () => {
    const wrapper = renderButtonGroup({ items: items1, limit: 0 });
    expect(wrapper.findShowMoreButton()!.findNativeButton().getElement()).toHaveAccessibleName('Show more');
  });

  test('uses showMoreButtonAriaLabel from i18nStrings', () => {
    const wrapper = renderButtonGroup({
      items: items1,
      limit: 0,
      i18nStrings: { showMoreButtonAriaLabel: 'Show more from i18nStrings' },
    });
    expect(wrapper.findShowMoreButton()!.findNativeButton().getElement()).toHaveAccessibleName(
      'Show more from i18nStrings'
    );
  });
});

describe('focus', () => {
  test('focuses the correct item', () => {
    const TestComponent = () => {
      const ref = useRef<ButtonGroupProps.Ref>(null);

      return (
        <div>
          <button onClick={() => ref.current?.focus('copy')}>Focus on copy</button>
          <ButtonGroup ref={ref} items={items1} limit={5} />
        </div>
      );
    };

    const { container } = render(<TestComponent />);
    const buttonGroup = createWrapper(container).findButtonGroup()!;
    fireEvent.click(screen.getByText('Focus on copy'));

    expect(buttonGroup.findInlineItemById('copy')!.getElement()).toHaveFocus();
  });

  test('focuses on show more button', () => {
    const TestComponent = () => {
      const ref = useRef<ButtonGroupProps.Ref>(null);

      return (
        <div>
          <button onClick={() => ref.current?.focus('upload')}>Focus on upload</button>
          <ButtonGroup ref={ref} items={items1} limit={5} />
        </div>
      );
    };

    const { container } = render(<TestComponent />);
    const buttonGroup = createWrapper(container).findButtonGroup()!;

    fireEvent.click(screen.getByText('Focus on upload'));
    const showMoreButton = buttonGroup.findShowMoreButton()!.getElement();
    expect(showMoreButton.getElementsByTagName('button')[0]).toHaveFocus();
  });
});
