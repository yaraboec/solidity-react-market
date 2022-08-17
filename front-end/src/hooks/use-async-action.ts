import { useCallback, useState } from "react";

type AsyncActionData = {
  isLoading: boolean;
  runAsyncAction: (
    action: () => Promise<any>,
    finallyAction?: () => void,
    sync?: boolean
  ) => Promise<void>;
};

export const useAsyncAction = (): AsyncActionData => {
  const [actionsInProgress, setActionsInProgress] = useState(0);

  const runAsyncAction = useCallback(
    async (
      action: () => Promise<any>,
      finallyAction?: () => void,
      sync?: boolean
    ) => {
      setActionsInProgress(actionsInProgress + 1);
      try {
        const tx = await action();

        if (sync) {
          await tx.wait(1);
        }
      } catch (e: any) {
        console.log(e);
      } finally {
        finallyAction?.();
        setActionsInProgress(actionsInProgress - 1);
      }
    },
    []
  );

  return {
    isLoading: actionsInProgress > 0,
    runAsyncAction,
  };
};
