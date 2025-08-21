import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Navbar from './Navbar';
import '@testing-library/jest-dom';

// Mock du logo si besoin (à adapter selon l'implémentation)

describe('Navbar', () => {
  it('affiche le logo', () => {
    render(<Navbar />);
    // Adapter le alt selon le composant réel
    expect(screen.getByAltText(/logo/i)).toBeInTheDocument();
  });

  it('affiche le lien Accueil', () => {
    render(<Navbar />);
    expect(screen.getByText(/accueil/i)).toBeInTheDocument();
  });
}); 