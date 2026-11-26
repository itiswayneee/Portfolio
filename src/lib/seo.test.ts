import test from 'node:test';
import assert from 'node:assert/strict';
import { getSiteData } from './seoEngine';
import {
  generateProfileMetaTags,
  generateProfileMetaTagsHtml,
  renderMetaTagsHtml,
  resolveAbsoluteUrl,
} from './seo';

test('resolveAbsoluteUrl resolves relative avatar paths against baseUrl', () => {
  assert.equal(
    resolveAbsoluteUrl('/avatar-placeholder.png', 'https://itiswayneee.dev/'),
    'https://itiswayneee.dev/avatar-placeholder.png'
  );
  assert.equal(
    resolveAbsoluteUrl('https://cdn.example.com/photo.jpg', 'https://itiswayneee.dev'),
    'https://cdn.example.com/photo.jpg'
  );
});

test('generateProfileMetaTags generates Open Graph and Twitter card metadata from profile data', () => {
  const { profile, socials } = getSiteData();
  const tags = generateProfileMetaTags(profile, {
    baseUrl: 'https://itiswayneee.dev',
    socials,
  });

  const byProp = new Map(
    tags.filter((t) => t.property).map((t) => [t.property!, t.content])
  );
  const byName = new Map(
    tags.filter((t) => t.name).map((t) => [t.name!, t.content])
  );

  assert.equal(byProp.get('og:type'), 'profile');
  assert.equal(byProp.get('og:title'), 'Samwel Wayne');
  assert.equal(byProp.get('og:description'), profile.shortBio);
  assert.equal(byProp.get('og:url'), 'https://itiswayneee.dev');
  assert.equal(byProp.get('og:image'), 'https://itiswayneee.dev/avatar-placeholder.png');
  assert.equal(byProp.get('profile:username'), 'itiswayneee');
  assert.equal(byProp.get('profile:first_name'), 'Samwel');
  assert.equal(byProp.get('profile:last_name'), 'Wayne');

  assert.equal(byName.get('twitter:card'), 'summary');
  assert.equal(byName.get('twitter:title'), 'Samwel Wayne');
  assert.equal(byName.get('twitter:description'), profile.shortBio);
  assert.equal(byName.get('twitter:image'), 'https://itiswayneee.dev/avatar-placeholder.png');
  assert.equal(byName.get('twitter:creator'), '@itiswayneee');
  assert.equal(byName.get('robots'), 'index, follow');
});

test('renderMetaTagsHtml escapes special HTML characters cleanly', () => {
  const html = renderMetaTagsHtml([
    { name: 'description', content: 'Samwel "Wayne" & <Co>' },
    { property: 'og:title', content: "Wayne's Site" },
  ]);
  assert.ok(html.includes('<meta name="description" content="Samwel &quot;Wayne&quot; &amp; &lt;Co&gt;" />'));
  assert.ok(html.includes('<meta property="og:title" content="Wayne&#39;s Site" />'));
});

test('generateProfileMetaTagsHtml renders valid Open Graph and Twitter meta tags', () => {
  const { profile, socials } = getSiteData();
  const html = generateProfileMetaTagsHtml(profile, {
    baseUrl: 'https://itiswayneee.dev',
    socials,
  });
  assert.ok(html.includes('<meta property="og:title" content="Samwel Wayne" />'));
  assert.ok(html.includes('<meta name="twitter:card" content="summary" />'));
  assert.ok(html.includes('<meta name="twitter:creator" content="@itiswayneee" />'));
});
