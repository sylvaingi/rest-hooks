---
title: <NetworkErrorBoundary />
---

Displays a fallback component when a network error happens in its subtree.

```tsx
interface Props {
  children: React.ReactNode;
  fallbackComponent: React.ComponentType<{
    error: NetworkError;
  }>;
}
export default class NetworkErrorBoundary extends React.Component<Props> {
  static defaultProps: {
    fallbackComponent: ({ error }: { error: NetworkError }) => JSX.Element;
  };
}
```

Custom fallback usage example:

```tsx
import React from 'react';
import { CacheProvider, NetworkErrorBoundary, NetworkError } from 'rest-hooks';

function ErrorPage({ error }: { error: NetworkError }) {
  return (
    <div>
      {error.status} {error.response && error.response.statusText}
    </div>
  );
}

export default function App(): React.ReactElement {
  return (
    <CacheProvider>
      <NetworkErrorBoundary fallbackComponent={ErrorPage}>
        <Router />
      </NetworkErrorBoundary>
    </CacheProvider>
  );
}
```

Note: Once `<NetworkErrorBoundary />` catches an error it will only render the fallback
until it is remounted. In many cases this will automatically happen upon navigation; however,
in the case the boundary is placed above the navigation (your `<Route/>` component) it will
need to be forced to remount by setting the key.

.e.g,)

```tsx
import { Suspense } from 'react';
import { NetworkErrorBoundary } from 'rest-hooks';
import { RouteChildrenProps } from 'react-router';

const App = ({ location }: RouteChildrenProps) => (
  <Suspense fallback={<Spinner />}>
    <NetworkErrorBoundary key={location && location.key}>
      <Routes />
    </NetworkErrorBoundary>
  </Suspense>
);
```
