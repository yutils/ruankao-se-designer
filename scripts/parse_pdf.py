# -*- coding: utf-8 -*-
"""从公开真题 PDF 中抽取上午卷单选题（题干 / 四个选项 / 答案 / 解析）

支持两种版式：
  A. 逐题解析版：  1.题干  /  A.xx  /  ...  /  答案：B  /  解析...
  B. 原卷+答案表： 题干 （1） / （1） A.xx B.xx C.xx D.xx / ...  +  卷末 "参考答案 1.B 2.C ..."
"""
import json
import os
import re
import glob
from pypdf import PdfReader

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(BASE, '_src', 'pdf')
OUT = os.path.join(BASE, '_src', 'questions.json')

NOISE = ('手机端题库', 'ruankaodaren', '历年', 'http', 'www.', '微信搜索',
         '内部资料', '禁止传播', '淘宝', 'QQ 群', '公众号')

FIG_WORDS = ('如下图', '下图', '如图', '图所示', '图中', '图示', '如下表', '下表',
             '表中', '上图', '下图所示', '见图', '如图1', '如下图1')

ANS_A = re.compile(r'(?:参考)?答案\s*[：:]\s*([A-D])\s*(?![A-D、,，])')
ANS_B = re.compile(r'(\d{1,3})\s*[.．、]\s*([A-D])(?![A-Za-z])')
QSTART_A = re.compile(r'(?m)^(\d{1,3})\s*[.．、]\s*(?!\d)')
OPT_A = re.compile(
    r'A\s*[.．、]\s*(?P<A>.*?)\s*B\s*[.．、]\s*(?P<B>.*?)\s*'
    r'C\s*[.．、]\s*(?P<C>.*?)\s*D\s*[.．、]\s*(?P<D>.*?)\s*$', re.S)

MARK_B = re.compile(r'（\s*(\d{1,3})\s*）\s*A\s*[.．、]\s*')
OPT_B = re.compile(
    r'\s*(?P<A>.*?)\s*B\s*[.．、]\s*(?P<B>.*?)\s*'
    r'C\s*[.．、]\s*(?P<C>.*?)\s*D\s*[.．、]\s*(?P<D>.*?)\s*$', re.S)


def parse_format_b_line(line_body):
    """只处理选项全部落在同一行内的题目，避免把下一题题干误并入 D 选项"""
    first = line_body.split('\n')[0]
    m = OPT_B.match(first)
    if not m:
        return None
    opts = [m.group(k).strip() for k in 'ABCD']
    if any(len(o) < 1 or len(o) > 90 for o in opts):
        return None
    return opts


def clean(t):
    # 去除 PDF 抽取产生的孤立代理项字符
    t = ''.join(ch for ch in t if not (0xD800 <= ord(ch) <= 0xDFFF))
    t = t.replace('\u3000', ' ').replace('\xa0', ' ')
    t = re.sub(r'[ \t]+', ' ', t)
    # 去掉汉字之间被 PDF 拆出来的空格
    t = re.sub(r'(?<=[\u4e00-\u9fa5])\s+(?=[\u4e00-\u9fa5])', '', t)
    t = re.sub(r'\n\s*\n+', '\n', t)
    return t.strip()


def strip_noise(text):
    out = []
    for ln in text.split('\n'):
        if any(w in ln for w in NOISE):
            continue
        if re.match(r'^\s*\d{4}\s*年.*真题.*$', ln):
            continue
        if re.match(r'^\s*\d+\s*/\s*\d+\s*$', ln):
            continue
        out.append(ln)
    return '\n'.join(out)


def norm_key(s):
    return re.sub(r'[\s，。、；：（）()“”"\'’_]+', '', s)


def good_stem(stem, fmt='A', num=None):
    stem = clean(stem).replace('\n', ' ')
    if not (10 <= len(stem) <= 320):
        return None
    if stem[-1] in '，、：；,;:':
        return None
    if any(w in stem for w in FIG_WORDS):
        return None
    if '单选' in stem or '问题 1' in stem or '富国老师' in stem:
        return None

    if fmt == 'B':
        nums = re.findall(r'（\s*(\d{1,3})\s*）', stem)
        if not nums or len(nums) != 1 or str(num) != nums[0]:
            return None
        return stem

    has_blank = any(x in stem for x in ('（ ）', '（）', '()', '______', '____', '( )'))
    if not has_blank:
        return None
    if re.search(r'（\s*[1-9]\s*）', stem):
        return None
    blanks = (len(re.findall(r'[_＿]{2,}', stem))
              + stem.count('（ ）') + stem.count('（）') + stem.count('( )'))
    if blanks > 1:
        return None
    return stem


def good_opts(opts):
    opts = [re.sub(r'\s{2,}', ' ', clean(o).replace('\n', ' ')) for o in opts]
    if any(len(o) < 1 or len(o) > 160 for o in opts):
        return None
    return opts


def parse_format_a(text):
    """逐题解析版"""
    starts = list(QSTART_A.finditer(text))
    res = []
    for i, m in enumerate(starts):
        end = starts[i + 1].start() if i + 1 < len(starts) else len(text)
        body = text[m.end():end]
        am = ANS_A.search(body)
        if not am:
            continue
        before = body[:am.start()]
        om = OPT_A.search(before)
        if not om:
            continue
        stem = good_stem(before[:om.start()])
        if not stem:
            continue
        opts = good_opts([om.group(k) for k in 'ABCD'])
        if not opts:
            continue
        analysis = clean(re.sub(r'https?://\S+', '', body[am.end():])).replace('\n', ' ')
        res.append({
            'num': int(m.group(1)), 'stem': stem, 'options': opts,
            'answer': 'ABCD'.index(am.group(1)),
            'analysis': re.sub(r'\s{2,}', ' ', analysis)[:400],
        })
    return res


def options_from_lines(lines):
    """从若干行中还原四个选项：支持「一行四项」与「每行一项」两种排版"""
    if not lines:
        return None
    first = lines[0]
    m = OPT_B.match(first)
    if m:
        opts = [m.group(k).strip() for k in 'ABCD']
        if all(1 <= len(o) <= 90 for o in opts):
            return opts, 1
    # 每行一项：A. ... / B. ... / C. ... / D. ...
    picked = {}
    end_idx = 0
    for idx, ln in enumerate(lines[:8]):
        mm = re.match(r'^\s*([A-D])\s*[.．、]\s*(.+)$', ln)
        if mm and mm.group(1) not in picked:
            picked[mm.group(1)] = mm.group(2).strip()
            end_idx = idx + 1
    if len(picked) == 4 and all(1 <= len(v) <= 90 for v in picked.values()):
        return [picked[k] for k in 'ABCD'], end_idx
    return None


def tail_stem(text):
    """取文本末尾的一句作为题干（去掉上一题解析等残留）"""
    t = clean(text).rstrip()
    while t.endswith(('。', '.', '．')):
        t = t[:-1]
    i = t.rfind('。')
    if i >= 0:
        t = t[i + 1:]
    return t.strip()


OPT_ANY = re.compile(
    r'A\s*[.．、]\s*(?P<A>.*?)\s*B\s*[.．、]\s*(?P<B>.*?)\s*'
    r'C\s*[.．、]\s*(?P<C>.*?)\s*D\s*[.．、]\s*(?P<D>.*)', re.S)


OPT_LINE = re.compile(r'^\s*[A-D]\s*[.．、]')
OPT_INLINE = re.compile(r'\s[A-D]\s*[.．、]\s*\S')


def split_options_and_next_stem(seg):
    """seg 从某个选项标记之后开始。返回（选项文本，下一题题干）"""
    lines = seg.split('\n')
    last = -1
    for idx, ln in enumerate(lines):
        if OPT_LINE.match(ln) or OPT_INLINE.search(ln):
            last = idx
    opt_text = '\n'.join(lines[:last + 1]) if last >= 0 else seg
    rest = '\n'.join(lines[last + 1:]) if last >= 0 else ''
    return opt_text, tail_stem(rest)


def parse_format_b(text, key_map):
    """原卷 + 卷末答案表：以「最后一个选项行」为分隔，切出下一题题干"""
    marks = [m for m in MARK_B.finditer(text) if int(m.group(1)) in key_map]
    if not marks:
        return []

    head_opt, stem = split_options_and_next_stem(text[:marks[0].start()])
    res = []
    for i, m in enumerate(marks):
        num = int(m.group(1))
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        seg = text[m.end():end]
        opt_text, next_stem = split_options_and_next_stem(seg)

        om = OPT_ANY.search('A. ' + opt_text)
        if om:
            opts = [clean(om.group(k)).replace('\n', ' ') for k in 'ABCD']
            opts = [re.sub(r'\s{2,}', ' ', o).strip() for o in opts]
            stem_ok = good_stem(stem, 'B', num)
            if stem_ok and all(1 <= len(o) <= 90 for o in opts):
                res.append({'num': num, 'stem': stem_ok, 'options': opts,
                            'answer': key_map[num], 'analysis': ''})
        stem = next_stem
    return res


def extract_answer_key(text):
    """从卷末答案表提取 {题号: 选项下标}"""
    key = {}
    for m in ANS_B.finditer(text):
        num = int(m.group(1))
        if 1 <= num <= 75:
            key[num] = 'ABCD'.index(m.group(2))
    return key


def parse_pdf(path, year):
    reader = PdfReader(path)
    raw = '\n'.join((p.extract_text() or '') for p in reader.pages)
    text = strip_noise(clean(raw))

    # 优先按逐题解析版解析
    qs = parse_format_a(text)
    if len(qs) >= 20:
        return qs, 'A'

    # 否则按原卷 + 答案表
    key = extract_answer_key(text)
    if len(key) >= 40:
        qs = parse_format_b(text, key)
        return qs, 'B'
    return [], '?'


def main():
    files = sorted(glob.glob(os.path.join(SRC, '*.pdf')))
    all_q, seen, stats = [], set(), {}
    for f in files:
        base = os.path.basename(f).replace('.pdf', '')
        m = re.search(r'(\d{4})年(\d{2})月', base)
        year = f'{m.group(1)}年{m.group(2)}月' if m else base
        try:
            qs, fmt = parse_pdf(f, year)
        except Exception as e:  # noqa
            print('SKIP', year, e)
            continue
        kept = 0
        for q in qs:
            k = norm_key(q['stem'])[:46]
            if k in seen:
                continue
            seen.add(k)
            q.update(year=year, source=f'{year}真题', fmt=fmt)
            all_q.append(q)
            kept += 1
        stats[year] = {'parsed': len(qs), 'kept': kept, 'format': fmt}

    with open(OUT, 'w', encoding='utf-8') as fp:
        json.dump(all_q, fp, ensure_ascii=False, indent=1)
    print(json.dumps(stats, ensure_ascii=False, indent=1))
    print('TOTAL', len(all_q))


if __name__ == '__main__':
    main()
