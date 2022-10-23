type PropsWithRequiredChildren<P> = Omit<P, 'children'> & { children: import('react').ReactNode };

type PropsWithFunctionAsChildren<P, Q> = Omit<P, 'children'> & {
  children: import('react').ReactNode | ((props: Q) => import('react').ReactElement);
};
