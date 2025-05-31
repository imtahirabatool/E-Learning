'use client';

import React from 'react';
import { useLoadUserQuery } from '@/redux/features/api/apiSlice';
import Loader from './Loader/Loader';

const Custom: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoading } = useLoadUserQuery({});

  return <>{isLoading ? <Loader /> : <>{children}</>}</>;
};

export default Custom;
