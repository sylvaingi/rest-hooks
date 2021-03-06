import React from 'react';
import mockState, { Fixture } from './mockState';
import { __INTERNAL__ } from '../index';
const { StateContext } = __INTERNAL__;

export default function MockProvider({
  children,
  results,
}: {
  children: React.ReactChild;
  results: Fixture[];
}) {
  const state = mockState(results);
  return (
    <StateContext.Provider value={state}>{children}</StateContext.Provider>
  );
}
