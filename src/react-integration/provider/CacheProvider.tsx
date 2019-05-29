import React, { ReactNode, useEffect } from 'react';
import { StateContext, DispatchContext } from '../context';
import masterReducer, {
  initialState as defaultState,
} from '../../state/reducer';
import NetworkManager from '../../state/NetworkManager';
import SubscriptionManager from '../../state/SubscriptionManager';
import PollingSubscription from '../../state/PollingSubscription';
import createEnhancedReducerHook from './middleware';
import { State, Manager } from '../../types';

interface ProviderProps {
  children: ReactNode;
  managers?: Manager[];
  initialState?: State<unknown>;
}

/** Controller managing state of the REST cache and coordinating network requests. */
export default function CacheProvider({
  children,
  managers = [
    new NetworkManager(),
    new SubscriptionManager(PollingSubscription),
  ],
  initialState = defaultState,
}: ProviderProps) {
  // TODO: option to use redux
  const useEnhancedReducer = createEnhancedReducerHook(
    ...managers.map(manager => manager.getMiddleware()),
  );
  const [state, dispatch] = useEnhancedReducer(masterReducer, initialState);

  // if we change out the manager we need to make sure it has no hanging async
  useEffect(() => {
    return () => {
      for (let i = 0; i < managers.length; ++i) {
        managers[i].cleanup();
      }
    };
  }, managers);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
