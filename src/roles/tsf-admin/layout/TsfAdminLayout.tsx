import React from 'react';
import { AppLayout, type AppLayoutProps } from '../../../shared/layout';

export type TsfAdminLayoutProps = AppLayoutProps;

export const TsfAdminLayout: React.FC<TsfAdminLayoutProps> = (props) => {
  return <AppLayout {...props} />;
};

export default TsfAdminLayout;
