import ContentTypeSelection from './ContentTypeSelection';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { contentTypeSelection } from '@constants/configCopy';
import { defaultNotification } from '@constants/defaultParams';
import { ContentTypeCustomRender } from '@test/helpers/ContentTypeCustomRender';
import { ContentTypeContext } from '@context/ContentTypeProvider';

describe('ContentTypeSelection component', () => {
  it('mounts and renders the correct title and button copy when no content type is selected', () => {
    const { unmount } = ContentTypeCustomRender(
      <ContentTypeSelection
        notification={defaultNotification}
        handleNotificationEdit={vi.fn()}></ContentTypeSelection>
    );

    expect(screen.getByText(contentTypeSelection.title)).toBeTruthy();
    expect(screen.getByText(contentTypeSelection.addButton)).toBeTruthy();
    unmount();
  });

  it('mounts and renders an input when a content type is selected', () => {
    const { unmount } = ContentTypeCustomRender(
      <ContentTypeSelection
        notification={{
          ...defaultNotification,
          contentTypeId: 'page',
          contentTypeName: 'Page',
        }}
        handleNotificationEdit={vi.fn()}></ContentTypeSelection>
    );

    expect(screen.getByRole('textbox')).toBeTruthy();
    unmount();
  });

  it('mounts and does not render modal for content type selection if content types are loading', () => {
    const { unmount } = ContentTypeCustomRender(
      <ContentTypeContext.Provider
        value={{
          loading: true,
          contentTypes: [],
          error: undefined,
          contentTypeConfigLink: '',
        }}>
        <ContentTypeSelection notification={defaultNotification} handleNotificationEdit={vi.fn()} />
      </ContentTypeContext.Provider>
    );

    const addButton = screen.getByText(contentTypeSelection.addButton);
    addButton.click();

    expect(screen.queryByTestId('cf-ui-modal')).toBeFalsy();
    unmount();
  });

  it('mounts and renders an error message if the saved content type is invalid', () => {
    const { unmount } = ContentTypeCustomRender(
      <ContentTypeSelection
        notification={{
          ...defaultNotification,
          contentTypeId: 'blogPost',
          contentTypeName: 'Blog Post',
        }}
        handleNotificationEdit={vi.fn()}></ContentTypeSelection>
    );

    expect(screen.getByText(contentTypeSelection.notFound)).toBeTruthy();
    unmount();
  });
});
