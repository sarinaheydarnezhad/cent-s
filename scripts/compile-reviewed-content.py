"""Compile the six private handoffs into a checked, deterministic Cent-only overlay.

Run from any directory. ZIP files are inspected, never extracted or copied to public/.
The legacy corpus stays immutable as rollback provenance. Only documented patches
are selected for math/logic/reading; publication subjects use canonical lesson JSON.
"""
import copy
import hashlib
import html
import json
import pathlib
import re
import uuid
import zipfile
import difflib
from html.parser import HTMLParser
from collections import Counter
from xml.etree import ElementTree

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONTENT = ROOT.parent / 'Backend/backend/Cent.Module/Content'
OUT = ROOT / 'docs/educational-reader-pilot/phase-4'

def load(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def identity(key):
    return str(uuid.UUID(bytes_le=hashlib.sha256(('cent-curriculum-v1:' + key).encode()).digest()[:16]))

def serial(value):
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))

def uid(value):
    return str(uuid.UUID(value)) if value else None

def plain(value):
    return html.unescape(re.sub('<[^>]+>', ' ', value)).strip()

def get(row, *keys, default=None):
    return next((row[k] for k in keys if k in row), default)

class Node:
    def __init__(self, tag='', attrs=(), text=None):
        self.tag, self.attrs, self.text, self.children, self.section = tag, dict(attrs), text, [], 0
    def walk(self):
        yield self
        for c in self.children: yield from c.walk()
    def render(self, section=None):
        if self.text is not None: return html.escape(self.text, quote=False) if section is None or self.section == section else ''
        if self.tag in ['style','script','nav','footer','link','meta'] or any(c in self.attrs.get('class','').split() for c in ['navbar','toc']): return ''
        content = ''.join(c.render(section) for c in self.children)
        if section is not None and not content and self.section != section: return ''
        if not self.tag: return content
        start = '<' + self.tag + ''.join(' '+k+'="'+html.escape(v or '',quote=True)+'"' for k,v in self.attrs.items()) + '>'
        return start + content + ('' if self.tag in Parser.void else '</'+self.tag+'>')

class Parser(HTMLParser):
    void = set('area base br col embed hr img input link meta param source track wbr'.split())
    def __init__(self, value):
        super().__init__(convert_charrefs=True); self.root = Node(); self.stack=[self.root]
        value=re.sub(r'<([A-Za-z\u2212][^\s<>/]*)(?=<)',lambda m:'&lt;'+m[1],value)
        self.feed(value)
    def handle_starttag(self, tag, attrs):
        node=Node(tag,attrs); self.stack[-1].children.append(node)
        if tag not in self.void: self.stack.append(node)
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag,attrs)
        if tag not in self.void: self.handle_endtag(tag)
    def handle_endtag(self, tag):
        indices=[i for i,n in enumerate(self.stack) if n.tag==tag]
        if indices: del self.stack[indices[-1]:]
    def handle_data(self, value): self.stack[-1].children.append(Node(text=value))

def rich_sections(source, key):
    doc=Parser(source).root; current=0
    headers={id(n) for n in doc.walk() if any(c in n.attrs.get('class','').split() for c in ['sec-head','section-head','section-title']) and any(c.tag=='h2' for c in n.walk())}
    def index(node, in_header=False):
        nonlocal current
        header=id(node) in headers
        if header and not in_header or node.tag=='h2' and not in_header: current+=1
        node.section=current
        for child in node.children: index(child,in_header or header)
    index(doc)
    result={key+('#intro' if i==0 else '#section-'+str(i).zfill(2)):doc.render(i) for i in range(current+1)}
    for node in doc.walk():
        if node.attrs.get('id'):
            heading=next((n for n in node.walk() if n.tag=='h2'),None)
            if heading: result.setdefault(key+'#'+node.attrs['id'],result[key+'#section-'+str(heading.section).zfill(2)])
    return result

def port_html_patch(source, before, after):
    # Use decoded text-node sequences to retain original attributes and SVGs.
    # Exact sequence matching fails closed if a correction has multiple targets.
    texts=lambda root:[n for n in root.walk() if n.text is not None and n.text.strip()]
    root=Parser(source).root; nodes=texts(root)
    a=[n.text for n in texts(Parser(before).root)]; b=[n.text for n in texts(Parser(after).root)]
    for tag,i,j,k,l in reversed(difflib.SequenceMatcher(None,a,b,autojunk=False).get_opcodes()):
        if tag=='equal': continue
        assert j>i, 'Standalone insertion needs explicit editorial resolution'
        matches=[n for n in range(len(nodes)-j+i+1) if [x.text for x in nodes[n:n+j-i]]==a[i:j]]
        if len(matches)>1:
            for context in range(1,9):
                left=max(0,i-context); right=min(len(a),j+context)
                narrowed=[n for n in matches if n>=i-left and [x.text for x in nodes[n-i+left:n+right-i]]==a[left:right]]
                if len(narrowed)==1: matches=narrowed; break
        assert len(matches)==1, 'Ambiguous source correction: '+repr(a[i:j])[:100]
        at=matches[0]; nodes[at].text=''.join(b[k:l])
        for node in nodes[at+1:at+j-i]: node.text=''
    return root.render()

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    sets = {k: {} for k in ['sources', 'chapters', 'topics', 'sections', 'exercises', 'questions', 'documents']}
    source_keys = {}
    def put(kind, row):
        row = copy.deepcopy(row)
        for key in ['Id', 'SourceId', 'TopicId', 'ChapterId', 'SourceSectionId', 'SourceExerciseId', 'TrainingId']:
            if key in row: row[key] = uid(row[key])
        sets[kind][row['Id']] = row
        return row
    corpus = [load(CONTENT / n) for n in ['curriculum.json', 'curriculum-2026.json', 'curriculum-2026-r2.json']]
    for package in corpus:
        for s in package['sources']:
            sid = identity('source:' + s['key']); source_keys[sid] = s['key']
            put('sources', dict(Id=sid, ImportKey=s['key'], CourseCode=s['course'], FileName=s['file'], Title=s['title'], OriginalTitle=s['originalTitle'], Sha256=s['sha256'], OriginalHtml=(CONTENT / 'Sources' / s['file']).read_text(encoding='utf-8-sig'), PlainText=s['text']))
        for c in package['chapters']:
            put('chapters', dict(Id=identity('chapter:' + c['key']), ImportKey=c['key'], CourseCode=c['course'], SourceId=identity('source:' + c['key'].split('#')[0]), Title=c['title'], SortOrder=c['sortOrder']))
        for t in package['topics']:
            put('topics', dict(Id=identity('topic:' + t['key']), ImportKey=t['key'], ChapterId=identity('chapter:' + t['chapterKey']), CourseCode=t['course'], Title=t['title'], EnglishTitle=t['englishTitle'], SortOrder=t['sortOrder'], Foundation=bool(t['foundation'])))
        for s in package['sections']:
            put('sections', dict(Id=identity('section:' + s['key']), SourceId=identity('source:' + s['sourceKey']), TopicId=identity('topic:' + s['topicKey']) if s['topicKey'] else None, ImportKey=s['key'], Heading=s['heading'], SortOrder=s['sortOrder'], Text=s['text'], Html=s['html']))
        for e in package['exercises']:
            finding = next((f for f in package.get('findings', []) if f['key'] == e['key']), None)
            put('exercises', dict(Id=identity('exercise:' + e['key']), SourceSectionId=identity('section:' + e['sectionKey']), TopicId=identity('topic:' + e['topicKey']) if e['topicKey'] else None, ImportKey=e['key'], Text=e['text'], OptionsJson=json.dumps(e['options'], ensure_ascii=True, separators=(',', ':')), OriginalCorrectAnswer=e['correctAnswer'], Solution=e['solution'], Status='quarantined' if finding and finding['action'] == 'quarantined' else e['status'], ReviewNote=finding['reason'] if finding else None))
        for q in package['questions']:
            put('questions', dict(Id=identity('question:' + q['key']), ImportKey=q['key'], Subject=q['course'], TopicId=identity('topic:' + q['topicKey']), Topic=next(t['title'] for t in package['topics'] if t['key'] == q['topicKey']), SourceSectionId=identity('section:' + q['sectionKey']), SourceExerciseId=identity('exercise:' + q['exerciseKey']) if q['exerciseKey'] else None, Text=q['text'], OptionsJson=json.dumps(q['options'], ensure_ascii=True, separators=(',', ':')), CorrectAnswer=q['correctAnswer'], Explanation=q['explanation'], Difficulty=q['difficulty'], Origin=q['origin'], FigureSvg=q['figureSvg'], Active=True, Kind='practice' if q['origin'] == 'authored-2026-reviewed' else 'both'))
    for sid, s in sets['sources'].items():
        put('documents', dict(Id=identity('document:' + s['ImportKey']), SourceId=sid, TrainingId=identity('training:' + s['CourseCode']), Title=s['Title'][:200], SortOrder=min(c['SortOrder'] for c in sets['chapters'].values() if c['SourceId'] == sid), PageCount=sum(sec['SourceId'] == sid for sec in sets['sections'].values())))
    original = copy.deepcopy(sets)
    rich_sources = {id:r['OriginalHtml'] for id,r in original['sources'].items() if r['CourseCode'] in ['math','logic','reading']}
    results = []; assessments = []; passages = []; mappings = []; issues = []; variants=[]
    canonical_ids = set(); publication_chapters=set(); publication_topics=set()
    for archive in sorted((ROOT / 'docs/Lessons').glob('*.zip')):
        with zipfile.ZipFile(archive) as z:
            names = z.namelist()
            assert len(names) == len(set(names)), 'Duplicate archive entry'
            inventory = []
            for info in z.infolist():
                assert not info.filename.startswith(('/', '\\')) and '..' not in pathlib.PurePosixPath(info.filename).parts
                assert info.file_size <= 30_000_000
                data = z.read(info)
                inventory.append(dict(path=info.filename, bytes=len(data), sha256=hashlib.sha256(data).hexdigest()))
                if info.filename.endswith('.json'): json.loads(data.decode('utf-8-sig'))
                if info.filename.endswith('.svg'): ElementTree.fromstring(data)
            read = lambda n: json.loads(z.read(n).decode('utf-8-sig'))
            if 'provenance/variant-groups.json' in names:
                for group in read('provenance/variant-groups.json'):
                    variants.append([uid(x) for x in (group['questionIds'] if isinstance(group,dict) else group)])
            subject = next(s for s, token in [('math', 'Mathematics'), ('physics', 'Physics'), ('chemistry', 'Chemistry'), ('biology', 'Biology'), ('logic', 'Logic'), ('reading', 'Reading')] if token in archive.name)
            result = dict(package=archive.name, subject=subject, sha256=hashlib.sha256(archive.read_bytes()).hexdigest(), inventory=inventory, readme=z.read('README.md').decode('utf-8-sig'), manifest=read('manifest.json') if 'manifest.json' in names else None)
            if subject in ['math', 'logic', 'reading']:
                patches = read('patches.json'); patched_fields = 0
                for patch in patches:
                    filename = get(patch, 'file', 'kind', default='')
                    kind = next(k for suffix, k in [('lesson-sections.json', 'sections'), ('questions.json', 'questions'), ('exercises.json', 'exercises')] if filename.endswith(suffix))
                    row = sets[kind][uid(patch['id'])]
                    assert row.get('ImportKey') == patch.get('importKey', row.get('ImportKey'))
                    fields = patch.get('fields') or ({patch['field']: dict(before=patch['before'], after=patch['after'])} if 'field' in patch else {key: dict(before=value, after=patch['after'][key]) for key, value in patch['before'].items()})
                    for field, edit in fields.items():
                        if field in ['options', 'correctOptionText', 'answerIndexBase']:
                            continue  # Redundant export fields; persisted key/options validated below.
                        same = json.loads(row[field]) == json.loads(edit['before']) if field == 'OptionsJson' else row[field] == edit['before']
                        assert same, f'{subject}: base conflict {patch["id"]} {field}'
                        row[field] = edit['after']; patched_fields += 1
                        if kind=='sections' and field=='Html' and subject=='math':
                            rich_sources[row['SourceId']] = port_html_patch(rich_sources[row['SourceId']], edit['before'], edit['after'])
                result.update(strategy='exact-field-patches', patchRecords=len(patches), patchFields=patched_fields)
                # The corrected sections are canonical. Source snapshots are historical;
                # never import reference copies or source-wide duplicated records.
                if subject == 'reading':
                    passages = read('existing-passages-canonical.json') + read('new-passages.json')
                    for q in read('new-questions.json'):
                        q = dict(q); q['Kind'] = 'package-only'; q['Active'] = True
                        put('questions', {k: q[k] for k in original['questions'][next(iter(original['questions']))] if k in q})
                    for a in read('mock-exams.json'): assessments.append(dict(id=a['id'], subject=subject, title=a['title'], durationMinutes=a['durationMinutes'], questionIds=[uid(x) for x in a['questionIds']], passageIds=a['passageIds']))
                if subject == 'logic':
                    for q in read('new-mock-questions.json'):
                        # The handoff supplies broad logic/data areas, not exact
                        # legacy skill IDs. Use the combined supplement topic;
                        # never claim every new item belongs to the first topic.
                        topic = dict(Id=identity('topic:logic/publication-v1.html#supplement'),Title='استدلال و تحلیل داده')
                        section = dict(Id=identity('section:logic/publication-v1.html#supplement'))
                        put('questions', dict(Id=q['id'], ImportKey='logic/v1/mock/' + q['id'], Subject=subject, TopicId=topic['Id'], Topic=topic['Title'], SourceSectionId=section['Id'], SourceExerciseId=None, Text=q['text'], OptionsJson=serial(q['options']), CorrectAnswer=q['correctAnswer'], Explanation=q['explanation'], Difficulty=q['difficulty'], Origin='itatest-original', FigureSvg=None, Active=True, Kind='package-only'))
                    assessments.append(dict(id='logic-itatest-mock-v1', subject=subject, title='آزمون تمرینی منطق', durationMinutes=30, questionIds=[uid(q['id']) for q in read('new-mock-questions.json')], passageIds=[]))
                    key='logic/publication-v1.html'; sid=identity('source:'+key); cid=identity('chapter:'+key+'#supplement'); tid=identity('topic:'+key+'#supplement')
                    markdown=z.read('supplemental-lesson.md').decode('utf-8-sig')
                    body=''.join(('<h3>'+html.escape(line.lstrip('# '))+'</h3>') if line.startswith('#') else '<p>'+html.escape(line)+'</p>' for line in markdown.splitlines() if line.strip())
                    put('sources',dict(Id=sid,ImportKey=key,CourseCode=subject,FileName=key,Title='تکمیل منطق و تحلیل داده',OriginalTitle='Logic supplement',Sha256='0'*64,OriginalHtml=body,PlainText=plain(body)));source_keys[sid]=key
                    put('chapters',dict(Id=cid,ImportKey=key+'#chapter',CourseCode=subject,SourceId=sid,Title='تکمیل منطق و تحلیل داده',SortOrder=101))
                    put('topics',dict(Id=tid,ImportKey=key+'#supplement',ChapterId=cid,CourseCode=subject,Title='استدلال و تحلیل داده',EnglishTitle='Reasoning on texts and data',SortOrder=1,Foundation=True))
                    put('sections',dict(Id=identity('section:'+key+'#supplement'),ImportKey=key+'#supplement',SourceId=sid,TopicId=tid,Heading='استدلال و تحلیل داده',SortOrder=1,Text=plain(body),Html=body))
                    put('documents',dict(Id=identity('document:'+key),SourceId=sid,TrainingId=identity('training:'+subject),Title='تکمیل منطق و تحلیل داده',SortOrder=101,PageCount=1))
            else:
                canonical_lessons = []; question_rows = []; exercise_rows = []
                for folder in sorted({n.rsplit('/', 1)[0] for n in names if re.fullmatch(r'chapters/\d+/chapter.json', n)}):
                    chapter = read(folder + '/chapter.json'); lessons = read(folder + '/lessons.json')
                    publication_chapters.add(uid(chapter['Id']))
                    if subject == 'chemistry':
                        key = 'chemistry/publication-v3.html'
                        sid = identity('source:' + key); source_keys[sid] = key
                        if sid not in sets['sources']:
                            put('sources', dict(Id=sid, ImportKey=key, CourseCode=subject, FileName=key, Title='شیمی — درس‌نامه بازبینی‌شده', OriginalTitle='Chemistry publication v3', Sha256='0' * 64, OriginalHtml='', PlainText=''))
                            put('documents', dict(Id=identity('document:' + key), SourceId=sid, TrainingId=identity('training:' + subject), Title='شیمی — درس‌نامه بازبینی‌شده', SortOrder=0, PageCount=50))
                        cid = uid(chapter['Id']); number = chapter['number']
                        put('chapters', dict(Id=cid, ImportKey=key + '#chapter-' + str(number), SourceId=sid, CourseCode=subject, Title=chapter['titleFa'], SortOrder=number))
                        for lesson in lessons:
                            lesson = dict(lesson)
                            lid = uid(lesson['Id']); tid = identity('publication-topic:' + lid)
                            lesson.update(SourceId=sid, TopicId=tid, ImportKey=key + '#' + lesson['lessonKey'], Heading=lesson['titleFa'], SortOrder=(number - 1) * 5 + lesson['sortOrder'])
                            put('topics', dict(Id=tid, ImportKey=lesson['ImportKey'], ChapterId=cid, CourseCode=subject, Title=lesson['titleFa'], EnglishTitle=lesson['titleEn'], SortOrder=lesson['SortOrder'], Foundation=True))
                            canonical_lessons.append(lesson)
                    else:
                        put('chapters', {k: chapter[k] for k in original['chapters'][next(iter(original['chapters']))]})
                        for topic in (read(folder + '/topics.json') if folder + '/topics.json' in names else []):
                            topic['Foundation'] = bool(topic['Foundation']); put('topics', topic)
                        canonical_lessons.extend(lessons)
                    question_rows.extend(read(folder + '/questions.json')); exercise_rows.extend(read(folder + '/exercises.json'))
                lesson_by_key = {l['lessonKey']: l for l in canonical_lessons}
                for lesson in canonical_lessons:
                    publication_topics.add(uid(lesson['TopicId']))
                    row = {k: lesson[k] for k in ['Id', 'SourceId', 'TopicId', 'ImportKey', 'Heading', 'SortOrder', 'Text', 'Html']}
                    canonical_ids.add(uid(row['Id'])); put('sections', row)
                for exercise in exercise_rows:
                    lesson = lesson_by_key[exercise['lessonKey']]
                    prior = sets['exercises'].get(uid(exercise['Id']), {})
                    row = dict(Id=exercise['Id'], ImportKey=exercise['ImportKey'], SourceSectionId=lesson['Id'], TopicId=lesson['TopicId'], Text=exercise['Text'], OptionsJson=get(exercise, 'OptionsJson', default='[]'), OriginalCorrectAnswer=exercise.get('OriginalCorrectAnswer'), Solution=exercise['Solution'], Status=get(exercise, 'Status', 'type', 'kind', default='open-response'), ReviewNote=prior.get('ReviewNote'))
                    put('exercises', row)
                    if not get(exercise,'linkedQuestionId') and row['OriginalCorrectAnswer'] is None:
                        section=sets['sections'][uid(lesson['Id'])]
                        if row['Text'] not in plain(section['Html']):
                            section['Html']+='<div class="exercise"><h3>تمرین خودآزمایی</h3><p>'+html.escape(row['Text'])+'</p><details><summary>نمایش راه‌حل</summary><p>'+html.escape(row['Solution'])+'</p></details></div>'
                for q in question_rows + read('mock-questions.json'):
                    lesson = lesson_by_key[q['lessonKey']]; old = sets['questions'].get(uid(q['Id']), {})
                    options = q['options']; assert q.get('answerIndexBase', 0) == 0 and q['correctOptionText'] == options[q['CorrectAnswer']]
                    put('questions', dict(Id=q['Id'], ImportKey=q['ImportKey'], Subject=subject, TopicId=lesson['TopicId'], Topic=lesson['Heading'], SourceSectionId=lesson['Id'], SourceExerciseId=q.get('SourceExerciseId', old.get('SourceExerciseId')), Text=q['Text'], OptionsJson=serial(options), CorrectAnswer=q['CorrectAnswer'], Explanation=q['Explanation'], Difficulty=q.get('Difficulty', 'unrated'), Origin=get(q, 'Origin', 'origin', default='itatest-original')[:32], FigureSvg=q.get('FigureSvg'), Active=True, Kind='package-only' if q in read('mock-questions.json') else old.get('Kind', 'both')))
                for a in read('assessments.json'):
                    assessments.append(dict(id=a['Id'], subject=subject, title=get(a, 'titleFa', 'title', default='آزمون تمرینی'), durationMinutes=a['durationMinutes'], questionIds=[uid(x) for x in a['questionIds']], passageIds=[]))
                mapping_name = next(n for n in names if n.endswith(('section-mapping.json', 'lesson-mapping.json')))
                for mapping in read(mapping_name):
                    mappings.append(dict(subject=subject, oldId=uid(mapping['oldSectionId']), newIds=[uid(x) for x in get(mapping, 'newSectionIds', 'replacementLessonIds', 'canonicalLessonIds', 'newLessonIds', default=[])], original=mapping))
                result.update(strategy='canonical-publication-with-private-legacy-provenance', canonicalLessons=len(canonical_lessons), canonicalPracticeQuestions=len(question_rows), mockQuestions=len(read('mock-questions.json')))
            results.append(result)
            if subject in ['logic','reading']:
                for name in names:
                    if name.startswith('database-sources/'+subject+'/') and name.endswith('.html'):
                        rich_sources[uid(pathlib.PurePosixPath(name).stem)] = z.read(name).decode('utf-8-sig')
    for source_id, source in rich_sources.items():
        rich=rich_sections(source,source_keys[source_id])
        for row in sets['sections'].values():
            if row['SourceId']==source_id:
                assert row['ImportKey'] in rich, 'Missing rich section '+row['ImportKey']
                row['Html']=rich[row['ImportKey']]
    # Preserve retired section/document identities and ordinal positions for notes,
    # bookmarks and old URLs, but replace superseded bodies with relocation notices.
    # Ambiguous mappings never select a new anchor or move private user records.
    for mapping in mappings:
        assert mapping['oldId'] in original['sections'], 'Unknown old annotation section'
        assert all(id in sets['sections'] for id in mapping['newIds']), 'Unknown replacement annotation section'
    for sid, old in original['sections'].items():
        subject = original['sources'][old['SourceId']]['CourseCode']
        if subject in ['biology', 'physics', 'chemistry'] and sid not in canonical_ids:
            mapping = next((m for m in mappings if m['oldId'] == sid), None)
            targets = [sets['sections'][i]['Heading'] for i in mapping['newIds'] if i in sets['sections']] if mapping else []
            message = 'این بخش در درس‌نامهٔ بازبینی‌شده ادغام شده است.'
            if targets: message += ' بخش‌های مرتبط: ' + '، '.join(targets)
            row = sets['sections'][sid]; row.update(Heading='راهنمای بخش بازبینی‌شده', Text=message, Html='<p>' + html.escape(message) + '</p>')
    # Build canonical per-source HTML from the final section records. These sources
    # are used for import and private provenance only; reader delivery sanitizes
    # the exact section rather than splitting again at nested headings.
    changed_source_ids = {s['SourceId'] for sid, s in sets['sections'].items() if original['sections'].get(sid) != s}
    for source_id in changed_source_ids:
        sections = sorted([s for s in sets['sections'].values() if s['SourceId'] == source_id], key=lambda s:s['SortOrder'])
        source = sets['sources'][source_id]
        source['OriginalHtml'] = '<main>' + ''.join('<section>' + s['Html'] + '</section>' for s in sections) + '</main>'
        source['PlainText'] = '\n'.join(s['Text'] for s in sections)
        source['Sha256'] = hashlib.sha256(source['OriginalHtml'].encode()).hexdigest()
    # Content checks cover all canonical rows, including answer text, aliases,
    # foreign keys, duplicate identifiers/positions, and assessment membership.
    for kind in sets:
        keys = [r['ImportKey'] for r in sets[kind].values() if 'ImportKey' in r]
        assert len(keys) == len(set(keys)), 'Duplicate import keys: ' + kind
    for row in sets['sections'].values():
        assert row['SourceId'] in sets['sources'] and (row['TopicId'] is None or row['TopicId'] in sets['topics'])
    positions = [(r['SourceId'], r['SortOrder']) for r in sets['sections'].values()]
    assert len(positions) == len(set(positions)), 'Duplicate section position'
    for q in sets['questions'].values():
        options = json.loads(q['OptionsJson'])
        assert 4 <= len(options) <= 5 and len(set(o.strip() for o in options)) == len(options)
        assert 0 <= q['CorrectAnswer'] < len(options) and q['Explanation'].strip()
        assert q['TopicId'] in sets['topics'] and q['SourceSectionId'] in sets['sections']
        assert sets['topics'][q['TopicId']]['CourseCode'] == q['Subject']
    fingerprints=[(q['Subject'],' '.join(q['Text'].split()).casefold(),tuple(sorted(' '.join(o.split()).casefold() for o in json.loads(q['OptionsJson'])))) for q in sets['questions'].values()]
    assert len(fingerprints)==len(set(fingerprints)), 'Duplicate question stem and options'
    for a in assessments:
        assert len(a['questionIds']) == len(set(a['questionIds'])) and all(i in sets['questions'] and sets['questions'][i]['Subject'] == a['subject'] for i in a['questionIds'])
        # Keep authored assessment membership unchanged unless it violates an
        # explicit variant exclusion. Conflicting definitions stay private.
        for group in variants:
            if len(set(a['questionIds']) & set(group))>1:
                issues.append('Assessment variant conflict withheld: '+a['id'])
    assessments=[a for a in assessments if not any(len(set(a['questionIds']) & set(g))>1 for g in variants)]
    for e in sets['exercises'].values():
        assert e['SourceSectionId'] in sets['sections']
    changes = []
    for kind, rows in sets.items():
        for id, row in rows.items():
            old = original[kind].get(id)
            fields = {k:v for k,v in row.items() if k != 'Id' and (old is None or old.get(k) != v)}
            if fields: changes.append(dict(entity=kind, id=id, before=None if old is None else {k:old[k] for k in fields}, after=fields))
    normalized_passages = []
    for entry in passages:
        p = entry['passage']; normalized_passages.append(dict(id=p['id'], text=p['text'], questionIds=[uid(x) for x in entry.get('questionIds', [])], questionKeys=[key for g in entry['groups'] for key in g['questionKeys']]))
    counts = lambda data: {s:{k:sum((r.get('CourseCode') or r.get('Subject') or (data['sources'].get(r.get('SourceId'), {}).get('CourseCode')) or (data['sources'].get(data['sections'].get(r.get('SourceSectionId'), {}).get('SourceId'), {}).get('CourseCode'))) == s for r in rows.values()) for k,rows in data.items()} for s in ['math','physics','chemistry','biology','logic','reading']}
    archived_chapters=[id for id,r in original['chapters'].items() if r['CourseCode'] in ['biology','physics','chemistry'] and id not in publication_chapters]
    archived_topics=[id for id,r in original['topics'].items() if r['CourseCode'] in ['biology','physics','chemistry'] and id not in publication_topics]
    canonical_sources={sets['sections'][id]['SourceId'] for id in canonical_ids}
    archived_sources=[id for id,r in original['sources'].items() if r['CourseCode'] in ['biology','physics','chemistry'] and id not in canonical_sources]
    payload = dict(version='itatest-reviewed-v4', changes=changes, assessments=assessments, passages=normalized_passages, sectionMappings=mappings, questionBank=list(sets['questions'].values()), variantGroups=variants, archivedChapterIds=archived_chapters, archivedTopicIds=archived_topics, archivedSourceIds=archived_sources)
    output = serial(payload)
    (CONTENT / 'reviewed-v4.json').write_text(output, encoding='utf-8')
    report = dict(packages=results, before=counts(original), after=counts(sets), changes={k:dict(updated=sum(c['entity']==k and c['before'] is not None for c in changes), created=sum(c['entity']==k and c['before'] is None for c in changes)) for k in sets}, catalogSha256=hashlib.sha256(output.encode()).hexdigest(), catalogBytes=len(output.encode()), assessments=len(assessments), passages=len(normalized_passages), sectionMappings=mappings, unresolved=issues)
    report['archivedCompatibilityRecords']=dict(chapters=len(archived_chapters),topics=len(archived_topics),sources=len(archived_sources),sections=sum(id not in canonical_ids and original['sources'][r['SourceId']]['CourseCode'] in ['biology','physics','chemistry'] for id,r in original['sections'].items()))
    report['annotationMappingSummary']=dict(total=len(mappings),oneToMany=sum(len(m['newIds'])>1 for m in mappings),noEquivalentSection=sum(not m['newIds'] for m in mappings),unknownTargets=0,policy='Preserve note identity, document, page, anchor quote and revision; retain compatibility location when no unique equivalent anchor exists. No automatic cross-document movement.')
    (OUT / 'package-validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(serial({k:v for k,v in report.items() if k not in ['packages','sectionMappings']}))

if __name__ == '__main__': main()
