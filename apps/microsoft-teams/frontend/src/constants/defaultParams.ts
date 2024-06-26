import { AppEventKey, AppInstallationParameters, SelectedEvents } from '@customTypes/configPage';

const initialParameters: AppInstallationParameters = {
  tenantId: '',
  orgName: '',
  orgLogo: '',
  authenticatedUsername: '',
  notifications: [],
};

const getDefaultSelectedEvents = (): SelectedEvents => {
  return Object.values(AppEventKey).reduce(
    (selectedEvents, event) => ({ ...selectedEvents, [event]: false }),
    {} as SelectedEvents
  );
};

const defaultNotification = {
  channel: {
    id: '',
    name: '',
    teamId: '',
    teamName: '',
    tenantId: '',
  },
  contentTypeId: '',
  contentTypeName: '',
  selectedEvents: getDefaultSelectedEvents(),
};

export { initialParameters, defaultNotification };
