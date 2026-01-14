import { useEffect, useRef, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * useAutoSave Hook
 * 
 * @param {Function} triggerSave - Function to execute the save (must be async)
 * @param {boolean} hasChanges - Whether there are changes to save
 * @param {number} saveInterval - Interval in ms for forced saves (default 30s)
 * @param {number} debounceMs - Debounce time in ms (default 2s)
 */
export const useAutoSave = ({ triggerSave, hasChanges, saveInterval = 30000, debounceMs = 2000 }) => {
    const isOnline = useOnlineStatus();
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);
    const latestTriggerSave = useRef(triggerSave);

    // Keep ref updated to avoid stale closures
    useEffect(() => {
        latestTriggerSave.current = triggerSave;
    }, [triggerSave]);

    // Main Save Logic
    const performSave = useCallback(async () => {
        if (!hasChanges) return;

        if (isOnline) {
            try {
                // Execute save
                await latestTriggerSave.current();
            } catch (err) {
                console.error("Auto-save failed:", err);
                // Retry logic is implicit: hasChanges remains true, so next interval/debounce will retry
            }
        } else {
            console.log("Offline: Save queued until online");
            // Queueing is implicit: hasChanges remains true until successful save
        }
    }, [hasChanges, isOnline]);

    // 1. Debounce Logic: Trigger on changes
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

    // 2. Interval Logic: Safety net
    useEffect(() => {
        if (!hasChanges) {
             if (intervalRef.current) clearInterval(intervalRef.current);
             return;
        }
        
        // Start interval if not running
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                performSave();
            }, saveInterval);
        }

        return () => {
             // We don't necessarily clear interval on unmount of *this effect* unless changes are gone,
             // but we MUST clear it on component unmount (React handles this return).
             if (intervalRef.current) {
                 clearInterval(intervalRef.current);
                 intervalRef.current = null;
             }
        };
    }, [hasChanges, saveInterval, performSave]);

    // 3. Online Sync Logic: Trigger immediately when coming back online
    useEffect(() => {
        if (isOnline && hasChanges) {
            performSave();
        }
    }, [isOnline, hasChanges, performSave]);
};
