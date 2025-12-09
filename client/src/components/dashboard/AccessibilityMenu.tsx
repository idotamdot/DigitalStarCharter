import React, { useState, useEffect, useRef } from 'react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useDebounce } from '@/hooks/use-debounce';

const AccessibilityMenu = () => {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['/api/users/me'],
  });

  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const debouncedFontSize = useDebounce(fontSize, 500);

  const mutation = useMutation({
    mutationFn: (settings) =>
      apiRequest.patch('/api/users/me/accessibility', settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
    },
  });

  useEffect(() => {
    if (user?.accessibility_settings && isInitialLoad) {
      const { highContrast, fontSize } = user.accessibility_settings;
      setHighContrast(highContrast || false);
      setFontSize(fontSize || 16);
      setIsInitialLoad(false);
    }
  }, [user, isInitialLoad]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast, fontSize]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (user && !isInitialLoad) {
      mutation.mutate({
        accessibility_settings: { highContrast, fontSize: debouncedFontSize },
      });
    }
  }, [highContrast, debouncedFontSize, user, mutation, isInitialLoad]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Accessibility Settings</h2>
      <div className="flex items-center justify-between mb-4">
        <Label htmlFor="high-contrast">High Contrast</Label>
        <Switch
          id="high-contrast"
          checked={highContrast}
          onCheckedChange={setHighContrast}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="font-size">Font Size</Label>
        <Slider
          id="font-size"
          min={12}
          max={24}
          step={1}
          value={[fontSize]}
          onValueChange={(value) => setFontSize(value[0])}
        />
        <div className="text-center">{fontSize}px</div>
      </div>
    </div>
  );
};

export default AccessibilityMenu;
