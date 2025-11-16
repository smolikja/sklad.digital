const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const partialsDir = path.join(srcDir, 'partials');
const templatesDir = path.join(srcDir, 'templates');
const stylesDir = path.join(srcDir, 'styles');
const dataDir = path.join(srcDir, 'data');

const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const readPartial = (name) => {
  const fullPath = path.join(partialsDir, `${name}.html`);
  return fs.readFileSync(fullPath, 'utf8').trim();
};

const loadJson = (filename) => JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));

const replacePlaceholders = (template, map) =>
  template.replace(/{{\s*([a-zA-Z0-9_-]+)\s*}}/g, (full, key) => {
    const value = map[key];
    if (typeof value === 'undefined') {
      throw new Error(`Missing placeholder value for "${key}".`);
    }
    return value;
  });

const renderLinks = (links = []) => {
  if (!links.length) return '';
  const content = links
    .map((link) => `<a href="${link.href}" target="_blank" rel="noreferrer">${link.label}</a>`)
    .join(' ·\n                  ');
  return `
                <p class="member__links">
                  ${content}
                </p>`;
};

const renderMediaItem = (item) => {
  const classAttr = item.className ? ` class="${item.className}"` : '';
  if (item.type === 'video') {
    const poster = item.poster ? ` poster="${item.poster}"` : '';
    const autoplay = item.autoplay ? ' autoplay' : '';
    return `<figure class="member__slide">
                  <video${classAttr} src="${item.src}" controls preload="none"${poster}${autoplay} muted playsinline loop></video>
                </figure>`;
  }
  return `<figure class="member__slide">
                  <img${classAttr} src="${item.src}" alt="${item.alt ?? ''}">
                </figure>`;
};

const renderMember = (member) => {
  const nameDisplay = member.nickname ? `${member.name} „${member.nickname}“` : member.name;
  const ariaLabel = member.ariaLabel || `Showcase ${member.name}`;
  const bioBlock = member.bio
    ? `
                <p class="member__bio">${member.bio}</p>`
    : '';
  const showcase =
    member.media && member.media.length
      ? `
            <div class="member__showcase" data-member-carousel>
              <div class="member__carousel-frame">
                <div class="member__carousel" role="group" aria-label="${ariaLabel}">
${member.media.map((item) => renderMediaItem(item)).join('\n')}
                </div>
              </div>
            </div>`
      : '';

  return `          <article class="member">
            <div class="member__header">
              <img src="${member.image.src}" alt="${member.image.alt}" width="${member.image.width}" height="${member.image.height}" loading="lazy">
              <div>
                <h3>${nameDisplay}</h3>
                <p class="member__role">${member.role}</p>${bioBlock}${renderLinks(member.links)}
              </div>
            </div>${showcase}
          </article>`;
};

const renderMembersSection = (members) => `      <section class="section section--members" id="clenove" aria-labelledby="clenove-heading">
        <div class="section__intro">
          <h2 id="clenove-heading">Členové SKLADu</h2>
          <p>Seznam se s lidmi, kteří prostor (a v něm) tvoří.</p>
        </div>
        <div class="member-list">
${members.map((member) => renderMember(member)).join('\n\n')}
        </div>
      </section>`;

const renderBenefitsSection = (benefits) => `      <section class="section section--benefits" id="vyhody">
        <div class="section__intro">
          <h2>Co SKLAD nabízí</h2>
        </div>
        <dl class="benefit-rows">
${benefits
  .map(
    (benefit) => `          <div>
            <dt>${benefit.icon ? `<img src="${benefit.icon}" alt="" class="benefit-icon"> ` : ''}${benefit.title}</dt>
            <dd>${benefit.description}</dd>
          </div>`,
  )
  .join('\n')}
        </dl>
      </section>`;

const renderFaqSection = (faqs) => `      <section class="section section--faq" id="faq" aria-labelledby="faq-heading">
        <div class="section__intro">
          <h2 id="faq-heading">FAQ</h2>
        </div>
        <div class="faq-columns">
${faqs
  .map(
    (item) => `          <article>
            <h3>${item.question}</h3>
            <p>${item.answer}</p>
          </article>`,
  )
  .join('\n')}
        </div>
      </section>`;

const buildHtml = () => {
  const layoutPath = path.join(templatesDir, 'layout.html');
  const layout = fs.readFileSync(layoutPath, 'utf8');
  const members = loadJson('members.json');
  const benefits = loadJson('benefits.json');
  const faqs = loadJson('faq.json');

  const placeholders = {
    head: readPartial('head'),
    hero: readPartial('hero'),
    about: readPartial('about'),
    members: renderMembersSection(members),
    benefits: renderBenefitsSection(benefits),
    community: readPartial('community'),
    faq: renderFaqSection(faqs),
    callout: readPartial('callout'),
    footer: readPartial('footer'),
    lightbox: readPartial('lightbox'),
    scripts: readPartial('scripts'),
  };

  const output = replacePlaceholders(layout, placeholders);
  const outputPath = path.join(rootDir, 'index.html');
  fs.writeFileSync(outputPath, `${output}\n`, 'utf8');
};

const copyDir = (from, to) => {
  ensureDir(to);
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const srcPath = path.join(from, entry.name);
    const destPath = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const buildStyles = () => {
  const cssOrder = [
    'tokens.css',
    'base.css',
    'layout.css',
    'components.css',
    'sections.css',
    'lightbox.css',
    'responsive.css',
    'utilities.css',
  ];

  const bundled = cssOrder
    .map((file) => fs.readFileSync(path.join(stylesDir, file), 'utf8'))
    .join('\n\n');

  const targetDir = path.join(rootDir, 'styles');
  ensureDir(targetDir);
  fs.writeFileSync(path.join(targetDir, 'main.css'), bundled, 'utf8');
};

const buildScripts = () => {
  const srcScripts = path.join(srcDir, 'js');
  const targetScripts = path.join(rootDir, 'scripts');
  copyDir(srcScripts, targetScripts);
};

const run = () => {
  buildHtml();
  buildStyles();
  buildScripts();
  console.log('Build complete: index.html, styles/main.css, scripts/* refreshed.');
};

run();
