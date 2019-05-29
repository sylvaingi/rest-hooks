import React, { ReactNode, useEffect } from 'react';
import { StateContext, DispatchContext } from '../context';
import masterReducer, {
  initialState as defaultState,
} from '../../state/reducer';
import NetworkManager from '../../state/NetworkManager';
import SubscriptionManager from '../../state/SubscriptionManager';
import PollingSubscription from '../../state/PollingSubscription';
import createEnhancedReducerHook from './middleware';
import { State } from '../../types';

interface ProviderProps {
  children: ReactNode;
  manager?: NetworkManager;
  subscriptionManager?: SubscriptionManager<any>;
  initialState?: State<unknown>;
}
/** Controller managing state of the REST cache and coordinating network requests. */
export default function CacheProvider({
  children,
  manager = new NetworkManager(),
  subscriptionManager = new SubscriptionManager(PollingSubscription),
  initialState = defaultState,
}: ProviderProps) {
  // TODO: option to use redux
  const useEnhancedReducer = createEnhancedReducerHook(
    manager.getMiddleware(),
    subscriptionManager.getMiddleware(),
  );
  const [state, dispatch] = useEnhancedReducer(masterReducer, initialState);

  // if we change out the manager we need to make sure it has no hanging async
  useEffect(() => {
    return () => {
      manager.cleanup();
    };
  }, [manager]);
  useEffect(() => {
    return () => {
      subscriptionManager.cleanup();
    };
  }, [subscriptionManager]);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
