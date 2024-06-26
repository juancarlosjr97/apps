import { errorTypes } from '@constants/enums';
import { errorMessages } from '@constants/errorMessages';
import { ConfigAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { ConfigPageContext } from '@contexts/ConfigPageProvider';
import { Errors, PreviewPathError } from '@customTypes/configPage';
import { isEmpty, pickBy } from 'lodash';
import { useContext } from 'react';

type Error =
  | Errors['authentication']
  | Errors['apiPathSelection']
  | Errors['projectSelection']
  | PreviewPathError;
type ErrorKeys =
  | keyof Errors['authentication']
  | keyof Errors['apiPathSelection']
  | keyof Errors['projectSelection']
  | keyof Omit<PreviewPathError, 'contentType'>;

export const getErrorMessage = (error: Error, currentSpaceId: string, contentType?: string) => {
  const currentError = pickBy(error);

  const errorKey: ErrorKeys = contentType
    ? (Object.keys(currentError)[1] as ErrorKeys)
    : (Object.keys(currentError)[0] as ErrorKeys);

  const message =
    errorKey === errorTypes.INVALID_SPACE_ID
      ? errorMessages.invalidSpaceId(currentSpaceId)
      : errorMessages[errorKey];
  return message;
};

const determineErrorPresence = (errors: Errors, currentError?: Error, contentType?: string) => {
  if (!contentType) return !isEmpty(pickBy(currentError));
  return errors.previewPathSelection.some(
    (error) =>
      error.contentType === contentType &&
      (error.invalidPreviewPathFormat || error.emptyPreviewPathInput)
  );
};

export const useError = ({
  error,
  contentType,
}: {
  error: Error | undefined;
  contentType?: string;
}) => {
  const { errors } = useContext(ConfigPageContext);
  const sdk = useSDK<ConfigAppSDK>();

  const errorMessage = error ? getErrorMessage(error, sdk.ids.space, contentType) : '';
  const isError = determineErrorPresence(errors, error, contentType);
  return { message: errorMessage, isError: isError };
};
