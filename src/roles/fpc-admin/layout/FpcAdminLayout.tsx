import React from 'react';
import { AppLayout, type AppLayoutProps } from '../../../shared/layout';

export type FpcAdminLayoutProps = AppLayoutProps;

export const FpcAdminLayout: React.FC<FpcAdminLayoutProps> = (props) => {
  return <AppLayout {...props} />;
};

export default FpcAdminLayout;
