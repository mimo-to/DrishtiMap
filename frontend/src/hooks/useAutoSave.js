import { useEffect, useRef, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';


export const useAutoSave = ({ triggerSave, hasChanges, saveInterval = 30000, debounceMs = 2000 }) => {
    const isOnline = useOnlineStatus();
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);
    const latestTriggerSave = useRef(triggerSave);

    useEffect(() => {
        latestTriggerSave.current = triggerSave;
    }, [triggerSave]);

    const performSave = useCallback(async () => {
        if (!hasChanges) return;

        if (isOnline) {
            try {
                await latestTriggerSave.current();
            } catch (err) {
                console.error("Auto-save failed:", err);
            }
        } else {

        }
    }, [hasChanges, isOnline]);

    useEffect(() => {
        if (!hasChanges) return;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            performSave();
        }, debounceMs);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [hasChanges, debounceMs, performSave]);

    useEffect(() => {
        if (!hasChanges) {
             if (intervalRef.current) clearInterval(intervalRef.current);
             return;
        }
        
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                performSave();
            }, saveInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [hasChanges, saveInterval, performSave]);

    useEffect(() => {
        if (isOnline && hasChanges) {
            performSave();
        }
    }, [isOnline, hasChanges, performSave]);
};
