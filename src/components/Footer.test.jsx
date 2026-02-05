/**
 * Footer Component Tests
 * 
 * Tests for footer social links, copyright, and structure
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
  describe('Copyright Text', () => {
    it('should display copyright text with current year', () => {
      const currentYear = new Date().getFullYear();
      render(<Footer />);
      
      expect(screen.getByText(new RegExp(`© ${currentYear} MindSync. All rights reserved.`))).toBeInTheDocument();
    });

    it('should display MindSync brand name', () => {
      render(<Footer />);
      
      expect(screen.getByText(/MindSync/)).toBeInTheDocument();
    });
  });

  describe('Social Media Links', () => {
    it('should render X/Twitter link', () => {
      render(<Footer />);
      
      const twitterLink = screen.getByLabelText('X (Twitter)');
      expect(twitterLink).toBeInTheDocument();
      expect(twitterLink).toHaveAttribute('href', 'https://twitter.com');
      expect(twitterLink).toHaveAttribute('target', '_blank');
      expect(twitterLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render Instagram link', () => {
      render(<Footer />);
      
      const instagramLink = screen.getByLabelText('Instagram');
      expect(instagramLink).toBeInTheDocument();
      expect(instagramLink).toHaveAttribute('href', 'https://instagram.com');
      expect(instagramLink).toHaveAttribute('target', '_blank');
      expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render TikTok link', () => {
      render(<Footer />);
      
      const tiktokLink = screen.getByLabelText('TikTok');
      expect(tiktokLink).toBeInTheDocument();
      expect(tiktokLink).toHaveAttribute('href', 'https://tiktok.com');
      expect(tiktokLink).toHaveAttribute('target', '_blank');
      expect(tiktokLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render all 3 social media links', () => {
      render(<Footer />);
      
      const socialLinks = screen.getAllByRole('link');
      expect(socialLinks).toHaveLength(3);
    });

    it('should have proper accessibility labels', () => {
      render(<Footer />);
      
      expect(screen.getByLabelText('X (Twitter)')).toBeInTheDocument();
      expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
      expect(screen.getByLabelText('TikTok')).toBeInTheDocument();
    });
  });

  describe('SVG Icons', () => {
    it('should render SVG icons for all social links', () => {
      const { container } = render(<Footer />);
      
      const svgIcons = container.querySelectorAll('svg');
      expect(svgIcons).toHaveLength(3);
    });

    it('should render X/Twitter icon with correct viewBox', () => {
      render(<Footer />);
      
      const twitterLink = screen.getByLabelText('X (Twitter)');
      const svg = twitterLink.querySelector('svg');
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });

    it('should render Instagram icon with stroke style', () => {
      render(<Footer />);
      
      const instagramLink = screen.getByLabelText('Instagram');
      const svg = instagramLink.querySelector('svg');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg).toHaveAttribute('fill', 'none');
    });

    it('should render TikTok icon with fill style', () => {
      render(<Footer />);
      
      const tiktokLink = screen.getByLabelText('TikTok');
      const svg = tiktokLink.querySelector('svg');
      expect(svg).toHaveAttribute('fill', 'currentColor');
    });
  });

  describe('Footer Structure', () => {
    it('should render footer element', () => {
      const { container } = render(<Footer />);
      
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should have container div', () => {
      const { container } = render(<Footer />);
      
      const footer = container.querySelector('footer');
      const containerDiv = footer.querySelector('div');
      expect(containerDiv).toBeInTheDocument();
    });

    it('should have social icons section with 3 links', () => {
      render(<Footer />);
      
      const socialLinks = screen.getAllByRole('link');
      expect(socialLinks.length).toBe(3);
    });

    it('should have copyright text with current year', () => {
      const currentYear = new Date().getFullYear();
      render(<Footer />);
      
      const copyrightText = screen.getByText(new RegExp(`© ${currentYear} MindSync. All rights reserved.`));
      expect(copyrightText).toBeInTheDocument();
    });
  });;

  describe('Link Security', () => {
    it('should have rel="noopener noreferrer" on all external links', () => {
      render(<Footer />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should open all links in new tab', () => {
      render(<Footer />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
      });
    });
  });
});
