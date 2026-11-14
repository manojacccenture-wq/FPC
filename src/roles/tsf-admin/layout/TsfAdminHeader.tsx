import React from 'react';
import { AppHeader, type AppHeaderProps } from '../../../shared/layout';

export type TsfAdminHeaderProps = AppHeaderProps;

export const TsfAdminHeader: React.FC<TsfAdminHeaderProps> = (props) => {
  return <AppHeader {...props} />;
};

export default TsfAdminHeader;
