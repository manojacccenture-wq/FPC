import React from 'react';
import { AppSidebar, type AppSidebarProps } from '../../../shared/layout';

export type TsfAdminSidebarProps = AppSidebarProps;

export const TsfAdminSidebar: React.FC<TsfAdminSidebarProps> = (props) => {
  return <AppSidebar {...props} />;
};

export default TsfAdminSidebar;
