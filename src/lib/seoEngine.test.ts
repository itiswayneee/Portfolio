import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePersonJsonLd,
  generateSchemaGraphJsonLd,
  generateSeoHeadHtml,
  getSiteData,
  SITE_URL,
  slugifyHandle,
} from './seoEngine';

test('getSiteData uses full name, updated avatar image, and @itiswayneee socials', () => {
  const data = getSiteData();
  assert.equal(data.profile.fullName, 'Samwel Wayne');
  assert.equal(data.profile.alternateName, 'itiswayneee');
  assert.equal(data.profile.avatarImage, '/samwel-wayne.jpg');
  assert.equal(data.socials.length, 4);
  assert.ok(data.socials.some((s) => s.url === 'https://www.instagram.com/itiswayneee/'));
});

test('slugifyHandle normalizes handle slugs', () => {
  assert.equal(slugifyHandle('@itiswayneee'), 'itiswayneee');
  assert.equal(slugifyHandle('  ItIsWayneee '), 'itiswayneee');
});

test('generatePersonJsonLd returns the simplified Person node with the new avatar URL', () => {
  const data = getSiteData();
  const jsonLd = generatePersonJsonLd(data, SITE_URL);

  assert.deepEqual(jsonLd, {
    '@type': 'Person',
    '@id': 'https://itiswayneee.dpdns.org/#person',
    name: 'Samwel Wayne',
    alternateName: 'itiswayneee',
    url: 'https://itiswayneee.dpdns.org/',
    description:
      'Samwel Wayne, known online as itiswayneee. Official personal website and social media profiles.',
    image: {
      '@type': 'ImageObject',
      url: 'https://itiswayneee.dpdns.org/samwel-wayne.jpg',
      width: 800,
      height: 800,
    },
    sameAs: [
      'https://www.instagram.com/itiswayneee/',
      'https://www.tiktok.com/@itiswayneee',
      'https://www.youtube.com/@itiswayneee',
      'https://github.com/itiswayneee',
    ],
  });
  assert.equal((jsonLd as Record<string, unknown>)['@context'], undefined);
  assert.equal(JSON.stringify(jsonLd).includes('avatar.png'), false);
});

test('generateSchemaGraphJsonLd emits the simplified WebSite, ProfilePage, and Person graph', () => {
  const data = getSiteData();
  const graphDoc = generateSchemaGraphJsonLd(data, SITE_URL);

  assert.equal(graphDoc['@context'], 'https://schema.org');
  const graph = graphDoc['@graph'] as Array<Record<string, unknown>>;
  assert.equal(graph.length, 3);

  assert.deepEqual(graph[0], {
    '@type': 'WebSite',
    '@id': 'https://itiswayneee.dpdns.org/#website',
    url: 'https://itiswayneee.dpdns.org/',
    name: 'Samwel Wayne',
    alternateName: 'itiswayneee',
    description: 'Official website of Samwel Wayne, also known as itiswayneee.',
  });

  assert.deepEqual(graph[1], {
    '@type': 'ProfilePage',
    '@id': 'https://itiswayneee.dpdns.org/#profilepage',
    url: 'https://itiswayneee.dpdns.org/',
    name: 'Samwel Wayne (@itiswayneee) - Official Website',
    isPartOf: { '@id': 'https://itiswayneee.dpdns.org/#website' },
    mainEntity: { '@id': 'https://itiswayneee.dpdns.org/#person' },
    dateModified: '2026-11-26',
  });

  assert.equal(graph[2]['@type'], 'Person');
  assert.deepEqual(graph[2].image, {
    '@type': 'ImageObject',
    url: 'https://itiswayneee.dpdns.org/samwel-wayne.jpg',
    width: 800,
    height: 800,
  });
});

test('generateSchemaGraphJsonLd omits fields that are not in the simplified schema', () => {
  const base = getSiteData();
  const graphDoc = generateSchemaGraphJsonLd(
    {
      ...base,
      profile: {
        ...base.profile,
        jobTitle: 'Software Engineer',
        affiliation: 'Acme Lab',
        contactEmail: 'hello@example.com',
      },
    },
    SITE_URL
  );
  const serialized = JSON.stringify(graphDoc);
  assert.ok(!serialized.includes('jobTitle'));
  assert.ok(!serialized.includes('affiliation'));
  assert.ok(!serialized.includes('contactPoint'));
  assert.ok(!serialized.includes('publisher'));
  assert.ok(!serialized.includes('about'));
});

test('generateSeoHeadHtml embeds the simplified ProfilePage @graph JSON-LD', () => {
  const data = getSiteData();
  const html = generateSeoHeadHtml(data, SITE_URL);
  assert.ok(html.includes('<title>Samwel Wayne</title>'));
  assert.ok(html.includes('application/ld+json'));
  assert.ok(html.includes('"@type": "ProfilePage"'));
  assert.ok(html.includes('"@type": "Person"'));
  assert.ok(html.includes('https://itiswayneee.dpdns.org/samwel-wayne.jpg'));
  assert.ok(!html.includes('avatar.png'));
});
