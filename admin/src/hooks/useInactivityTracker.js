import { useEffect } from 'react';
import useAuth from 'hooks/useAuth';

export default function useInactivityTracker() {
  const { isLoggedIn, logout } = useAuth();
  const timeout = 30 * 60 * 1000; // 30 minutes
  const warningTime = 2 * 60 * 1000; // 2 minute warning

  useEffect(() => {
    if (!isLoggedIn) return;

    let checkInterval;
    let lastActivityTime = parseInt(localStorage.getItem('lastActivity') || Date.now());
    let warningShown = localStorage.getItem('warningShown') === 'true';
    let logoutShown = localStorage.getItem('logoutShown') === 'true';

    // Update activity in all tabs
    const updateActivity = () => {
      const newTime = Date.now();
      lastActivityTime = newTime;
      localStorage.setItem('lastActivity', newTime.toString());
      warningShown = false;
      logoutShown = false;
      localStorage.removeItem('warningShown');
      localStorage.removeItem('logoutShown');
    };

    // Handle storage events from other tabs
    const handleStorageEvent = (event) => {
      switch (event.key) {
        case 'lastActivity':
          lastActivityTime = parseInt(event.newValue || Date.now().toString());
          warningShown = false;
          logoutShown = false;
          break;

        case 'warningShown':
          if (!warningShown) {
            alert('You will be logged out in 1 minute due to inactivity!');
            warningShown = true;
          }
          break;

        case 'logoutShown':
          if (!logoutShown) {
            alert('You have been logged out due to inactivity.');
            logoutShown = true;
            performLogout();
          }
          break;
      }
    };

    // Perform the actual logout
    const performLogout = () => {
      clearInterval(checkInterval);
      logout();
    };

    // Check inactivity state
    const checkInactivity = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - lastActivityTime;

      if (elapsed >= timeout - warningTime && elapsed < timeout && !warningShown) {
        alert('You will be logged out in 1 minute due to inactivity!');
        warningShown = true;
        localStorage.setItem('warningShown', 'true');
      } else if (elapsed >= timeout && !logoutShown) {
        alert('You have been logged out due to inactivity.');
        logoutShown = true;
        localStorage.setItem('logoutShown', 'true');
        performLogout();
      }
    };

    // Set up listeners
    window.addEventListener('storage', handleStorageEvent);
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'mousedown', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, updateActivity));

    // Start checking activity every second
    checkInterval = setInterval(checkInactivity, 1000);

    // Initial check
    checkInactivity();

    // Cleanup
    return () => {
      clearInterval(checkInterval);
      window.removeEventListener('storage', handleStorageEvent);
      events.forEach((e) => window.removeEventListener(e, updateActivity));
    };
  }, [isLoggedIn, logout]);
}
