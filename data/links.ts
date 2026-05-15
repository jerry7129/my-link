export interface Link {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  clickCount: number;
}

export const demoLinks: Link[] = [
  {
    id: '1',
    title: 'Instagram',
    url: 'https://instagram.com/yourusername',
    createdAt: new Date('2023-01-01T10:00:00Z').toISOString(),
    clickCount: 0,
  },
  {
    id: '2',
    title: 'YouTube',
    url: 'https://youtube.com/c/yourchannel',
    createdAt: new Date('2023-01-02T10:00:00Z').toISOString(),
    clickCount: 0,
  },
  {
    id: '3',
    title: 'Blog',
    url: 'https://yourblog.com',
    createdAt: new Date('2023-01-03T10:00:00Z').toISOString(),
    clickCount: 0,
  },
  {
    id: '4',
    title: 'Github',
    url: 'https://github.com/yourusername',
    createdAt: new Date('2023-01-04T10:00:00Z').toISOString(),
    clickCount: 0,
  },
  {
    id: '5',
    title: 'Portfolio',
    url: 'https://yourportfolio.com',
    createdAt: new Date('2023-01-05T10:00:00Z').toISOString(),
    clickCount: 0,
  },
];
