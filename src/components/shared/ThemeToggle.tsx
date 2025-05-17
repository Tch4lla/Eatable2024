import { useTheme } from '@/context/ThemeContext';
import { Button } from '../ui/button';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      className="shad-button_ghost"
      onClick={toggleTheme}
    >
      <span className="text-xl mr-2">{theme === 'dark' ? '☀️' : '🌙'}</span>
      <p className="small-medium lg:base-medium">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </p>
    </Button>
  );
};

export default ThemeToggle;
