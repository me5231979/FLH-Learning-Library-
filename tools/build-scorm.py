#!/usr/bin/env python3
"""Build one SCORM 1.2 package per course from its self-paced edition.

Package layout mirrors the repo so relative asset paths keep working; any
link that resolves outside the package is rewritten to the live site. The
launch page gets a small SCORM 1.2 shim (initialize -> completed -> finish)
that stays inert outside an LMS."""
import re, os, glob, html, shutil, zipfile, posixpath, unicodedata

ROOT = '/home/user/Course_Library'
OUT = os.path.join(ROOT, 'scorm')
STAGE = '/tmp/claude-0/-home-user/06c38174-c772-502e-9c0c-38998ade2b5b/scratchpad/scorm_stage'
SITE = 'https://me5231979.github.io/Course_Library/'
os.chdir(ROOT)

SHIM = """<script>
/* SCORM 1.2 shim: report launch/completion to the hosting LMS.
   Outside an LMS (no API found) this does nothing. */
(function () {
  function findAPI(win) {
    var n = 0;
    while (win && n++ < 10) {
      try { if (win.API) return win.API; } catch (e) {}
      if (win.parent && win.parent !== win) { win = win.parent; continue; }
      break;
    }
    try { if (window.opener) return findAPI(window.opener); } catch (e) {}
    return null;
  }
  var api = findAPI(window), up = false;
  if (!api) return;
  function init() {
    if (up) return;
    up = true;
    try {
      api.LMSInitialize('');
      var s = api.LMSGetValue('cmi.core.lesson_status');
      if (s !== 'completed' && s !== 'passed') {
        api.LMSSetValue('cmi.core.lesson_status', 'completed');
      }
      api.LMSCommit('');
    } catch (e) {}
  }
  function fin() {
    if (!up) return;
    up = false;
    try { api.LMSCommit(''); api.LMSFinish(''); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('pagehide', fin);
  window.addEventListener('beforeunload', fin);
})();
</script>
"""

MANIFEST = """<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="edu.vanderbilt.flh.{slug}" version="1.0"
    xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
    xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                        http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                        http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-{slug}">
    <organization identifier="ORG-{slug}">
      <title>{title}</title>
      <item identifier="ITEM-{slug}" identifierref="RES-{slug}" isvisible="true">
        <title>{title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-{slug}" type="webcontent" adlcp:scormtype="sco" href="{launch}">
{files}
    </resource>
  </resources>
</manifest>
"""


def collect_courses():
    t = open('index.html', encoding='utf-8').read()
    rows = []
    for m in re.finditer(r'<article class="course(?! course--soon)[^"]*"[^>]*>(.*?)</article>', t, re.S):
        body = m.group(1)
        title = html.unescape(re.search(r'<h3[^>]*>(.*?)</h3>', body).group(1))
        sp = re.search(r'<a class="btn btn--ghost-dark" href="([^"]+)">Self-paced edition</a>', body).group(1)
        slug = re.search(r'class="course__syllabus" href="syllabus-([^"]+)\.html"', body).group(1)
        rows.append((title, sp.lstrip('./').rstrip('/'), slug))
    return rows


def plan(sp):
    """returns (list of (repo_path, package_path), launch_path)"""
    items = []
    if sp.endswith('/web') or '/web' in sp:                       # Type A
        course = posixpath.dirname(sp)                            # courses/X
        items.append((f'{sp}/index.html', 'web/index.html'))
        for extra in ('cheatsheet.html', 'worksheet.html'):
            p = f'{course}/{extra}'
            if os.path.exists(p):
                items.append((p, extra))
        for f in glob.glob(f'{course}/assets/**/*', recursive=True):
            if os.path.isfile(f) and not f.endswith('social-card.png'):
                items.append((f, posixpath.relpath(f, course)))
        return items, 'web/index.html'
    if sp == 'learn':                                             # Type C
        items.append(('learn/index.html', 'index.html'))
        for f in glob.glob('learn/assets/**/*', recursive=True):
            if os.path.isfile(f):
                items.append((f, posixpath.relpath(f, 'learn')))
        return items, 'index.html'
    # Type B: learn/<name>
    name = posixpath.basename(sp)
    items.append((f'{sp}/index.html', f'{name}/index.html'))
    for f in glob.glob('learn/assets/**/*', recursive=True):
        if os.path.isfile(f):
            items.append((f, posixpath.relpath(f, 'learn')))
    return items, f'{name}/index.html'


URLRE = re.compile(r'((?:href|src)=")([^"#][^"]*)(")')
CSSURL = re.compile(r"(url\(')([^')]+)('\))")
ANALYTICS = re.compile(r"<!-- Vercel Web Analytics[^>]*-->\s*<script>.*?</script>\s*", re.S)


def rewrite_html(text, repo_path, pkg_path, pkg_files, extra_files):
    """keep in-package relative refs; point everything else at the live site.
    css url() refs to real repo files get bundled under shared/ instead."""
    text = ANALYTICS.sub('', text)
    repo_dir = posixpath.dirname(repo_path)
    pkg_dir = posixpath.dirname(pkg_path)
    depth = pkg_dir.count('/') + (1 if pkg_dir else 0)
    up = '../' * depth

    def fix(m):
        url = m.group(2)
        if re.match(r'^(https?:|mailto:|data:|tel:|javascript:|//)', url):
            return m.group(0)
        bare = url.split('#')[0].split('?')[0]
        if not bare:
            return m.group(0)
        pkg_target = posixpath.normpath(posixpath.join(pkg_dir, bare))
        if bare.endswith('/'):
            pkg_target = posixpath.join(pkg_target, 'index.html')
        if pkg_target in pkg_files:
            return m.group(0)
        repo_target = posixpath.normpath(posixpath.join(repo_dir, url))
        if repo_target.startswith('..'):
            repo_target = ''
        return m.group(1) + SITE + repo_target + m.group(3)

    def fixcss(m):
        url = m.group(2)
        if re.match(r'^(https?:|data:|//)', url):
            return m.group(0)
        bare = url.split('#')[0].split('?')[0]
        pkg_target = posixpath.normpath(posixpath.join(pkg_dir, bare))
        if pkg_target in pkg_files:
            return m.group(0)
        repo_target = posixpath.normpath(posixpath.join(repo_dir, bare))
        if not repo_target.startswith('..') and os.path.exists(repo_target):
            shared = 'shared/' + posixpath.basename(bare)
            extra_files[shared] = repo_target
            return m.group(1) + up + shared + m.group(3)
        return m.group(0)

    return CSSURL.sub(fixcss, URLRE.sub(fix, text))


def build(title, sp, slug):
    items, launch = plan(sp)
    pkg_files = {p for _, p in items}
    stage = os.path.join(STAGE, slug)
    shutil.rmtree(stage, ignore_errors=True)
    extra_files = {}
    for repo_p, pkg_p in items:
        dst = os.path.join(stage, pkg_p)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if pkg_p.endswith(('.html', '.css', '.js')):
            t = open(repo_p, encoding='utf-8').read()
            if pkg_p.endswith('.html'):
                t = rewrite_html(t, repo_p, pkg_p, pkg_files, extra_files)
            if pkg_p == launch and '</body>' in t:
                t = t.replace('</body>', SHIM + '</body>', 1)
            open(dst, 'w', encoding='utf-8').write(t)
        else:
            shutil.copy2(repo_p, dst)
    for shared, repo_src in extra_files.items():
        dst = os.path.join(stage, shared)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(repo_src, dst)
        items.append((repo_src, shared))
        pkg_files.add(shared)
    files_xml = '\n'.join(f'      <file href="{p}"/>' for p in sorted(pkg_files))
    man = MANIFEST.format(slug=slug, title=html.escape(title), launch=launch, files=files_xml)
    open(os.path.join(stage, 'imsmanifest.xml'), 'w', encoding='utf-8').write(man)
    os.makedirs(OUT, exist_ok=True)
    zp = os.path.join(OUT, f'{slug}-scorm12.zip')
    if os.path.exists(zp):
        os.remove(zp)
    with zipfile.ZipFile(zp, 'w', zipfile.ZIP_DEFLATED) as z:
        z.write(os.path.join(stage, 'imsmanifest.xml'), 'imsmanifest.xml')
        for _, pkg_p in sorted(items, key=lambda x: x[1]):
            z.write(os.path.join(stage, pkg_p), pkg_p)
    return zp, len(items), os.path.getsize(zp)


rows = collect_courses()
assert len(rows) == 28, len(rows)
total = 0
for title, sp, slug in rows:
    zp, n, size = build(title, sp, slug)
    total += size
    print(f'{slug:34} {n:3} files  {size/1024:7.0f} KB')
print(f'\n28 packages, total {total/1024/1024:.1f} MB -> {OUT}')
