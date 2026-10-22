# -*- coding: utf-8 -*-
"""
把抽取到的真题转换为站点数据文件（含章节/小节归类）。

使用前需要先生成两个中间文件（均不随仓库分发，见 .gitignore）：

  1. `python scripts/parse_pdf.py`
     从自备的真题 PDF 抽取题目，产出 `_src/questions.json`
  2. `_src/section_titles.json`
     由章节源文件提取的小节标题，可用一行命令生成：
       python -c "import re,glob,json;print(json.dumps({m.group(1):m.group(2)
         for f in glob.glob('src/data/chapters/ch*.js')
         for m in re.finditer(r\"id: '([^']+)',\\s*\\n\\s*title: '([^']+)'\", open(f,encoding='utf-8').read())},
         ensure_ascii=False))" > _src/section_titles.json

PDF 涉及第三方版权，仓库不附带，请自备后放入 `_src/pdf/`。
"""
import json
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TITLES_PATH = os.path.join(BASE, '_src', 'section_titles.json')
SRC = os.path.join(BASE, '_src', 'questions.json')
OUT = os.path.join(BASE, 'src', 'data', 'exam', 'real-imported.js')

if not os.path.exists(SRC) or not os.path.exists(TITLES_PATH):
    sys.exit(
        '缺少中间文件：请先运行 `python scripts/parse_pdf.py` 生成 _src/questions.json，\n'
        '并生成 _src/section_titles.json（方法见本文件开头注释）。'
    )

TITLES = json.load(open(TITLES_PATH, encoding='utf-8'))

CHAPTERS = {
    'ch01': ('计算机组成与体系结构', ['补码', '原码', '反码', '移码', '浮点', 'Cache', '缓存', '流水线',
                                '海明', 'CRC', '校验', '总线', '指令', 'RISC', 'CISC', '寻址', 'CPU',
                                '寄存器', '存储器', '中断', 'DRAM', 'SRAM', '主存', '可靠度', 'MIPS',
                                'CPI', '主频', '冯诺依曼', '磁盘', '编址', '闪存', '容量', '字节']),
    'ch02': ('操作系统', ['进程', '线程', '信号量', 'PV', '死锁', '页面', '页式', '段式', '置换', '磁盘调度',
                      '文件系统', '目录', '索引节点', '作业', '时间片', '临界', '银行家', '操作系统', '调度',
                      '缓冲区', '虚存', '存储管理', '相对路径', '绝对路径']),
    'ch03': ('数据库系统', ['数据库', '关系模式', '范式', '函数依赖', '主键', '外键', '主码', 'SQL', '视图',
                        '事务', 'E-R', '元组', '完整性', '并发', '聚簇', '触发器', '存储过程', '数据仓库',
                        '候选码', '闭包']),
    'ch04': ('计算机网络', ['网络', '协议', 'IP 地址', '子网', '端口', '路由', '交换机', 'TCP', 'UDP', 'HTTP',
                        'DNS', 'OSI', '拓扑', '带宽', '域名', '局域网', '以太网', '报文', 'ARP', '防火墙']),
    'ch05': ('信息安全', ['加密', '解密', '数字签名', '证书', '病毒', '攻击', '防火墙', '认证', '木马', '入侵',
                      '安全', '密钥', '报文摘要', '访问控制', '备份', '完整性', '可用性']),
    'ch06': ('标准化与知识产权', ['著作权', '专利', '商标', '知识产权', '标准', '侵权', '保护期', '软件文档',
                            '发表权', '署名权']),
    'ch07': ('程序设计语言与编译原理', ['编译', '文法', '自动机', '正规式', '词法', '语法', '语义', '后缀式',
                                '表达式', '参数传递', '程序设计语言', '解释程序', '汇编', '符号表', 'NFA', 'DFA']),
    'ch08': ('数据结构与算法', ['二叉树', '结点', '有向图', '无向图', '排序', '查找', '哈希', '散列', '栈', '队列',
                          '链表', '复杂度', '邻接', '遍历', '堆', '数组', '矩阵', '广义表', '拓扑序列',
                          '折半', '循环队列', '线性表']),
    'ch09': ('算法设计与分析', ['动态规划', '贪心', '分治', '回溯', '背包', '算法设计', '最优子结构', '分支限界']),
    'ch10': ('面向对象技术', ['面向对象', 'UML', '设计模式', '类图', '用例', '继承', '多态', '封装', '聚合',
                         '组合', '接口', '观察者', '策略', '中介者', '装饰']),
    'ch11': ('软件工程', ['软件工程', '瀑布', '原型', '增量', '螺旋', '需求分析', '测试', '维护', '耦合', '内聚',
                      'CMM', '风险', '敏捷', '生命周期', '覆盖', 'McCabe', '甘特', 'PERT', '配置管理',
                      '软件质量', '复用', '数据流图', '加工', '外部实体', '模块', '文档', '项目管理',
                      '可行性', '结构化']),
}

SECTIONS = {
    'ch01-1': ['补码', '原码', '反码', '移码', '浮点', '进制', '溢出'],
    'ch01-2': ['海明', 'CRC', '校验', '奇偶'],
    'ch01-3': ['指令', 'RISC', 'CISC', '寻址', 'CPU', '流水线', '控制器', '寄存器', 'PC'],
    'ch01-4': ['Cache', '缓存', '主存', '存储器', '磁盘', '编址', '容量', 'DRAM', 'SRAM'],
    'ch01-5': ['总线', '中断', 'DMA', 'I/O', '接口'],
    'ch01-6': ['可靠度', '可靠性', 'MIPS', 'CPI', '主频', '性能'],
    'ch02-1': ['操作系统', '嵌入式', '功能'],
    'ch02-2': ['进程', '线程', '状态', '调度', '时间片'],
    'ch02-3': ['信号量', 'PV', '互斥', '同步', '临界'],
    'ch02-4': ['死锁', '银行家', '安全序列'],
    'ch02-5': ['页面', '页式', '段式', '置换', '虚存', '存储管理'],
    'ch02-6': ['文件', '目录', '索引节点', '路径', '位示图'],
    'ch02-7': ['磁盘调度', 'SPOOLing', '设备'],
    'ch03-1': ['三级模式', '外模式', '内模式', '数据模型'],
    'ch03-2': ['E-R', '实体', '联系', '关系模式', '主键', '外键'],
    'ch03-3': ['关系代数', '投影', '选择', '笛卡尔', '元组'],
    'ch03-4': ['SQL', '视图', 'GRANT', 'GROUP', '查询'],
    'ch03-5': ['范式', '函数依赖', '候选码', '闭包', '规范化'],
    'ch03-6': ['事务', '并发', '锁', '隔离', '备份', '恢复'],
    'ch03-7': ['分布式', '数据仓库', 'OLAP', '数据挖掘'],
    'ch04-1': ['OSI', 'TCP/IP', '分层', '协议'],
    'ch04-2': ['子网', 'IP 地址', '掩码', 'CIDR', '私有'],
    'ch04-3': ['TCP', 'UDP', '端口', '握手'],
    'ch04-4': ['HTTP', 'DNS', 'FTP', 'SMTP', 'DHCP', 'SNMP'],
    'ch04-5': ['路由器', '交换机', '拓扑', 'ping', 'netstat'],
    'ch05-1': ['攻击', '安全要素', '被动', '主动'],
    'ch05-2': ['加密', '密钥', 'DES', 'AES', 'RSA'],
    'ch05-3': ['签名', '证书', '认证', '摘要', 'PKI'],
    'ch05-4': ['防火墙', '入侵', 'VPN', 'WAF'],
    'ch05-5': ['病毒', '木马', '蠕虫', '访问控制'],
    'ch06-1': ['著作权', '专利', '商标', '侵权', '保护期', '归属'],
    'ch06-2': ['标准', 'GB', 'ISO', '代号'],
    'ch07-1': ['语言', '汇编', '解释', '编译型'],
    'ch07-2': ['词法', '语法', '语义', '符号表', '目标代码'],
    'ch07-3': ['文法', '自动机', '正规式', 'NFA', 'DFA', '语法树'],
    'ch07-4': ['后缀式', '表达式', '参数传递', '作用域'],
    'ch08-1': ['复杂度', '渐进'],
    'ch08-2': ['栈', '队列', '链表', '线性表', '循环队列'],
    'ch08-3': ['二叉树', '结点', '哈夫曼', '遍历', '树'],
    'ch08-4': ['图', '邻接', '拓扑', '最小生成树', '关键路径'],
    'ch08-5': ['查找', '折半', '哈希', '散列'],
    'ch08-6': ['排序', '堆', '归并', '快速排序'],
    'ch09-1': ['分治', '动态规划', '贪心', '回溯', '策略'],
    'ch09-2': ['分治', '归并'],
    'ch09-3': ['动态规划', '背包'],
    'ch09-4': ['贪心'],
    'ch09-5': ['回溯', '分支限界'],
    'ch10-1': ['对象', '类', '封装', '继承', '多态', '重载'],
    'ch10-2': ['UML', '类图', '用例', '序列图', '状态图', '聚合', '组合'],
    'ch10-3': ['面向对象分析', '面向对象设计', '边界类'],
    'ch10-4': ['设计模式', '模式', '单例', '工厂', '观察者', '策略', '中介者', '装饰', '桥接'],
    'ch10-5': ['设计原则', '开闭', '单一职责', '依赖倒置'],
    'ch11-1': ['瀑布', '原型', '增量', '螺旋', '敏捷', 'RUP', '生命周期', '模型'],
    'ch11-2': ['需求', '数据流图', '数据字典', '用例'],
    'ch11-3': ['耦合', '内聚', '模块', '体系结构'],
    'ch11-4': ['测试', '覆盖', 'McCabe', '路径', '用例'],
    'ch11-5': ['维护'],
    'ch11-6': ['风险', '甘特', 'PERT', '配置管理', 'CMM', '进度', '估算'],
    'ch11-7': ['质量', '复用', 'ISO'],
}


def is_english(stem):
    letters = len(re.findall(r'[A-Za-z]', stem))
    return letters > len(stem) * 0.45


def classify(q):
    stem = q['stem']
    if is_english(stem):
        return 'ch12', 'ch12-2'
    scores = {}
    for cid, (_, kws) in CHAPTERS.items():
        score = 0
        for kw in kws:
            if kw in stem:
                score += 3 if len(kw) >= 2 else 1
        scores[cid] = score
    best = max(scores, key=lambda k: scores[k])
    if scores[best] == 0:
        best = 'ch11'
    # 小节
    sec_scores = {sid: sum(3 for kw in kws if kw in stem) for sid, kws in SECTIONS.items() if sid.startswith(best + '-')}
    sec = max(sec_scores, key=lambda k: sec_scores[k]) if sec_scores and max(sec_scores.values()) > 0 else f'{best}-1'
    return best, sec


BROKEN_PREFIX = ('该', '此', '上述', '这一')
BROKEN_HINT = ('定义如下', '代码如下', '程序如下', '如下所示', '图所示')

# 原卷 OCR 残缺、答案存疑或表述与教材冲突，人工复核后剔除
DROP_STEMS = (
    '假设关系 R<U, F>',      # 候选键与选项自相矛盾
    'SQL注入',                 # 答案与常识不符
    '根据渐进分析',            # 待排序序列在图中，题干缺失
    '以下关于 SRAM和 DRAM',    # 选项“集成率低/高”原卷前后矛盾
)

# 明显的 OCR 错字修正
FIXUPS = (
    ('中请', '申请'),
    ('MTTF/(1+MTTF)', 'MTTF/(MTTF+MTTR)'),
    ('CICS', 'CISC'),
    ('部门门', '部门'),
    ('乙获得该项专利申', '乙获得该项专利申请权'),
)


def bad(q):
    s = q['stem']
    if re.match(r'^[A-D]\s*[.．、]', s):
        return True
    # 题干依赖未渲染的图/代码，无法独立作答
    if s.startswith(BROKEN_PREFIX):
        return True
    if any(h in s for h in BROKEN_HINT):
        return True
    if s.startswith(DROP_STEMS):
        return True
    # 题干必须收尾完整
    if not s.rstrip().endswith(('。', '？', '！', '）', ')', '…')):
        return True
    if '答案' in s or '解析' in s:
        return True
    for o in q['options']:
        # 选项里混入下一题的选项标记 / 答案 / 题干
        if re.search(r'[A-D]\s*[.．、]\s*\S', o):
            return True
        if '参考答案' in o or '解析' in o:
            return True
        if len(o) > 62:
            return True
    if len(set(q['options'])) < 4:
        return True
    return False


def js(s):
    return json.dumps(s, ensure_ascii=False)


def main():
    data = json.load(open(SRC, encoding='utf-8'))
    rows = []
    seen = set()
    counter = {}
    for q in data:
        if bad(q):
            continue
        key = re.sub(r'[\W_]+', '', q['stem'])[:40]
        if key in seen:
            continue
        seen.add(key)
        ch, sec = classify(q)
        y = q['year'].replace('年', '').replace('月', '')
        ymap = {'202011': '2020下', '202205': '2022上', '202211': '2022下'}
        year = ymap.get(y, q['year'])
        counter[year] = counter.get(year, 0) + 1
        tag = {'2020下': '2020b', '2022上': '2022a', '2022下': '2022b'}.get(year, y)
        qid = f"real-{tag}-{counter[year]:02d}"
        analysis = q['analysis'].strip()
        # 去掉混入的下一题答案/解析
        for marker in ('参考答案', '参考解析'):
            idx = analysis.find(marker)
            if idx > 0:
                analysis = analysis[:idx].strip()
        analysis = analysis.replace('解析：', '').replace('解析:', '').strip()
        analysis = analysis[:260].strip()
        if len(analysis) < 14:
            t = TITLES.get(sec, sec)
            analysis = f"本题考查「{t}」。结合考点逐项排除，正确答案为 {'ABCD'[q['answer']]}。"
        def fix(t):
            for a, b in FIXUPS:
                t = t.replace(a, b)
            return t

        rows.append({
            'id': qid, 'year': year, 'source': f'{year}真题',
            'chapterId': ch, 'sectionId': sec,
            'stem': fix(q['stem'].strip().replace('其企业信息系统', '某企业信息系统')),
            'options': [fix(o) for o in q['options']], 'answer': q['answer'],
            'analysis': analysis.replace('解析：', '').strip()[:360],
        })

    lines = [
        '/**',
        ' * 历年真题（自动抽取自公开真题卷 PDF，已剔除含图、多空、选项残缺的题目）',
        ' * 来源：2020年11月、2022年5月、2022年11月 软件设计师上午真题（公开卷）',
        ' * 生成脚本：scripts/parse_pdf.py + scripts/export_real.py',
        ' */',
        '',
        'const q = (o) => ({ real: true, difficulty: 2, ...o })',
        '',
        'export const importedReal = [',
    ]
    for r in rows:
        lines.append('  q({')
        lines.append(f"    id: {js(r['id'])}, year: {js(r['year'])}, source: {js(r['source'])},")
        lines.append(f"    chapterId: {js(r['chapterId'])}, sectionId: {js(r['sectionId'])},")
        lines.append(f"    stem: {js(r['stem'])},")
        lines.append(f"    options: {js(r['options'])}.map(String), answer: {r['answer']},")
        lines.append(f"    analysis: {js(r['analysis'])}")
        lines.append('  }),')
    lines.append(']')
    lines.append('')
    lines.append('export default importedReal')
    lines.append('')

    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(lines))

    print('exported', len(rows), counter)
    from collections import Counter
    print(Counter(r['chapterId'] for r in rows))


if __name__ == '__main__':
    main()
