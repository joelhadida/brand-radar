import { useState } from 'react';
import { MainMenu } from './components/MainMenu';
import { ProjectMenu } from './components/ProjectMenu';
import { StreamZeroApp } from './components/StreamZeroApp';
import { CenteiApp } from './components/CenteiApp';

export default function App() {
  const [screen, setScreen] = useState('main'); // main, stream-zero, infoproductos, centeia

  const handleMainMenuSelect = (option) => {
    if (option === 'stream-zero') {
      setScreen('stream-zero');
    } else if (option === 'infoproductos') {
      setScreen('infoproductos');
    }
  };

  const handleProjectSelect = (projectId) => {
    if (projectId === 'centeia') {
      setScreen('centeia');
    }
  };

  const handleBack = () => {
    if (screen === 'centeia' || screen === 'stream-zero') {
      setScreen('main');
    } else if (screen === 'infoproductos') {
      setScreen('main');
    }
  };

  return (
    <>
      {screen === 'main' && <MainMenu onSelect={handleMainMenuSelect} />}
      {screen === 'infoproductos' && <ProjectMenu onSelect={handleProjectSelect} onBack={handleBack} />}
      {screen === 'stream-zero' && <StreamZeroApp onBack={handleBack} />}
      {screen === 'centeia' && <CenteiApp onBack={handleBack} />}
    </>
  );
}
