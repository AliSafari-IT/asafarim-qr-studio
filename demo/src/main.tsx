import React from 'react';
import { createRoot } from 'react-dom/client';
import { QRStudio } from '@asafarim/qr-studio/react';
createRoot(document.getElementById('root')!).render(<React.StrictMode><QRStudio/></React.StrictMode>);
