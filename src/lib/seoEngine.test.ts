import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePersonJsonLd,
  generateSchemaGraphJsonLd,
  generateSeoHeadHtml,
  getSiteData,
  slugifyHandle,
} from './seoEngine';

test('getSiteData uses full name, avatar image, and @itiswayneee socials', () => {
  const data = getSiteData();
  assert.equal(data.profile.fullName, 'Samwel Wayne');
  assert.equal(data.profile.alternateName, 'itiswayneee');
  assert.equal(data.profile.avatarImage, '/avatar.png');
  assert.equal(data.socials.length, 4);
});

test('slugifyHandle normalizes handle slugs', () => {
  assert.equal(slugifyHandle('@itiswayneee'), 'itiswayneee');
  assert.equal(slugifyHandle('  ItIsWayneee '), 'itiswayneee');
});

test('generatePersonJsonLd includes full name, alternateName, ImageObject, ContactPoint, and sameAs', () => {
  const data = getSiteData();
  const jsonLd = generatePersonJsonLd(data, 'https://itiswayneee.dev');
  assert.equal(jsonLd['@context'], 'https://schema.org');
  assert.equal(jsonLd['@type'], 'Person');
  assert.equal(jsonLd['@id'], 'https://itiswayneee.dev/#person');
  assert.equal(jsonLd.name, 'Samwel Wayne');
  assert.equal(jsonLd.alternateName, 'itiswayneee');
  assert.deepEqual(jsonLd.image, {
    '@type': 'ImageObject',
    '@id': 'https://itiswayneee.dev/#avatar',
    url: 'https://itiswayneee.dev/avatar.png',
    contentUrl: 'https://itiswayneee.dev/avatar.png',
    width: 800,
    height: 800,
    caption: 'Samwel Wayne (@itiswayneee)',
  });
  assert.deepEqual(jsonLd.contactPoint, {
    '@type': 'ContactPoint',
    contactType: 'personal',
    email: 'hello@itiswayneee.dpdns.org',
    url: 'https://itiswayneee.dev',
  });
  const sameAs = jsonLd.sameAs as string[];
  assert.equal(sameAs.length, 4);
  assert.ok(!sameAs.some((url) => /x\.com|linkedin\.com/.test(url)));
});

test('generateSchemaGraphJsonLd links WebSite, ProfilePage, and Person in @graph', () => {
  const data = getSiteData();
  const graphDoc = generateSchemaGraphJsonLd(data, 'https://itiswayneee.dev');
  assert.equal(graphDoc['@context'], 'https://schema.org');
  const graph = graphDoc['@graph'] as Array<Record<string, unknown>>;
  assert.equal(graph.length, 3);
  assert.equal(graph[0]['@type'], 'WebSite');
  assert.equal(graph[1]['@type'], 'ProfilePage');
  assert.deepEqual(graph[1].mainEntity, { '@id': 'https://itiswayneee.dev/#person' });
  assert.equal(graph[2]['@type'], 'Person');
});

test('generateSeoHeadHtml sets full name as exact page <title> and embeds ProfilePage @graph JSON-LD', () => {
  const data = getSiteData();
  const html = generateSeoHeadHtml(data, 'https://itiswayneee.dev');
  assert.ok(html.includes('<title>Samwel Wayne</title>'));
  assert.ok(html.includes('application/ld+json'));
  assert.ok(html.includes('"@type": "ProfilePage"'));
  assert.ok(html.includes('"@type": "Person"'));
});

test('generatePersonJsonLd includes jobTitle and affiliation when provided', () => {
  const base = getSiteData();
  const jsonLd = generatePersonJsonLd(
    {
      ...base,
      profile: {
        ...base.profile,
        jobTitle: 'Software Engineer',
        affiliation: 'Acme Lab',
      },
    },
    'https://itiswayneee.dev'
  );
  assert.equal(jsonLd.jobTitle, 'Software Engineer');
  assert.deepEqual(jsonLd.affiliation, {
    '@type': 'Organization',
    name: 'Acme Lab',
  });
});
