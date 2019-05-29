import { useState, useMemo, useRef } from 'react';
import compose from 'lodash/fp/compose';
import { Middleware } from '../../types';

// TODO: release as own library?
/** Redux-middleware compatible integration for useReducer() */
export default function createEnhancedReducerHook(
  ...middlewares: Middleware[]
) {
  const useEnhancedReducer = <R extends React.Reducer<any, any>>(
    reducer: R,
    startingState: React.ReducerState<R>,
  ): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>] => {
    const state = useRef(startingState);
    const [_, forceUpdate] = useState();

    let outerDispatch = useMemo(() => {
      let middlewareDispatch: React.Dispatch<React.ReducerAction<R>> = () => {
        throw new Error(
          `Dispatching while constructing your middleware is not allowed. ` +
            `Other middleware would not be applied to this dispatch.`,
        );
      };

      const dispatch = (action: React.ReducerAction<R>) => {
        // emulate useReducer but in a synchronous way, enabling
        // middlewares to access the latest state
        state.current = reducer(state.current, action)
        forceUpdate(state.current)
        return action;
      }

      // closure here around dispatch allows us to change it after middleware is constructed
      const middlewareAPI = {
        getState: () => state.current,
        dispatch: (action: React.ReducerAction<R>) => middlewareDispatch(action),
      };
      const chain = middlewares.map(middleware => middleware(middlewareAPI));
      middlewareDispatch = compose(chain)(dispatch);

      return middlewareDispatch;
    }, []);

    return [state.current, outerDispatch];
  };
  return useEnhancedReducer;
}
