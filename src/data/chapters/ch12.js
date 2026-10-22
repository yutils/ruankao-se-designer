export default {
  id: 'ch12',
  order: 12,
  title: '专业英语',
  short: '专业英语',
  weight: 5,
  importance: 2,
  intro:
    '固定 5 分，一篇约 200 词的计算机专业短文，5 道选择题。**性价比极高**：掌握高频词汇 + 定位技巧，保 3 争 5。',
  examFocus: ['软件工程术语', '设计模式英文名', '网络与安全术语', '数据库术语'],
  sections: [
    {
      id: 'ch12-1',
      title: '题型与解题策略',
      importance: 2,
      tags: ['技巧'],
      blocks: [
        { t: 'h', c: '1. 题型特征' },
        { t: 'ul', items: [
          '一篇 150~250 词的说明文，主题多为**软件工程、设计模式、数据库、网络、AI、云计算**。',
          '5 个选择题，多为**细节题**（问文中某概念是什么、某方法的作用）与**词义题**。',
          '空格式（cloze）与问答式两种形式都出现过。'
        ]},
        { t: 'h', c: '2. 三步解题法' },
        { t: 'ol', items: [
          '**先读题干**，圈出关键词（专有名词、数字、大写缩写），不要一上来通读全文。',
          '**回原文定位**：关键词所在句及其前后一句，通常就是答案出处。',
          '**排除绝对化选项**：含 all、never、must、only 的选项往往是干扰项（除非原文明确如此）。'
        ]},
        { t: 'tip', title: '时间分配', c: '专业英语建议 **8 分钟内**完成。它是全卷最容易“用时间换分数”的部分，不要纠缠生词。' }
      ]
    },
    {
      id: 'ch12-2',
      title: '高频词汇（按主题）',
      importance: 3,
      tags: ['必背'],
      blocks: [
        { t: 'h', c: '1. 软件工程' },
        { t: 'table', head: ['英文', '中文', '英文', '中文'], rows: [
          ['requirement analysis', '需求分析', 'feasibility study', '可行性研究'],
          ['software lifecycle', '软件生命周期', 'maintainability', '可维护性'],
          ['modularity', '模块化', 'cohesion', '内聚'],
          ['coupling', '耦合', 'encapsulation', '封装'],
          ['inheritance', '继承', 'polymorphism', '多态'],
          ['abstraction', '抽象', 'refactoring', '重构'],
          ['prototype', '原型', 'incremental', '增量'],
          ['waterfall model', '瀑布模型', 'spiral model', '螺旋模型'],
          ['agile development', '敏捷开发', 'iteration', '迭代'],
          ['sprint', '冲刺', 'backlog', '待办列表'],
          ['regression testing', '回归测试', 'unit testing', '单元测试'],
          ['white-box testing', '白盒测试', 'black-box testing', '黑盒测试'],
          ['code coverage', '代码覆盖率', 'defect / bug', '缺陷'],
          ['configuration management', '配置管理', 'baseline', '基线'],
          ['milestone', '里程碑', 'deliverable', '交付物']
        ]},
        { t: 'h', c: '2. 设计模式（英文名必认）' },
        { t: 'table', head: ['英文', '中文', '英文', '中文'], rows: [
          ['Singleton', '单例', 'Factory Method', '工厂方法'],
          ['Abstract Factory', '抽象工厂', 'Builder', '建造者'],
          ['Prototype', '原型', 'Adapter', '适配器'],
          ['Bridge', '桥接', 'Composite', '组合'],
          ['Decorator', '装饰器', 'Facade', '外观'],
          ['Flyweight', '享元', 'Proxy', '代理'],
          ['Chain of Responsibility', '责任链', 'Command', '命令'],
          ['Interpreter', '解释器', 'Iterator', '迭代器'],
          ['Mediator', '中介者', 'Memento', '备忘录'],
          ['Observer', '观察者', 'State', '状态'],
          ['Strategy', '策略', 'Template Method', '模板方法'],
          ['Visitor', '访问者', 'creational / structural / behavioral', '创建型/结构型/行为型']
        ]},
        { t: 'h', c: '3. 数据库' },
        { t: 'table', head: ['英文', '中文', '英文', '中文'], rows: [
          ['relation / table', '关系/表', 'tuple / row', '元组/行'],
          ['attribute / column', '属性/列', 'primary key', '主键'],
          ['foreign key', '外键', 'candidate key', '候选键'],
          ['normalization', '规范化', 'functional dependency', '函数依赖'],
          ['transaction', '事务', 'commit / rollback', '提交/回滚'],
          ['concurrency control', '并发控制', 'deadlock', '死锁'],
          ['index', '索引', 'query optimization', '查询优化'],
          ['data warehouse', '数据仓库', 'data mining', '数据挖掘'],
          ['OLAP', '联机分析处理', 'OLTP', '联机事务处理']
        ]},
        { t: 'h', c: '4. 网络与安全' },
        { t: 'table', head: ['英文', '中文', '英文', '中文'], rows: [
          ['bandwidth', '带宽', 'latency', '延迟'],
          ['throughput', '吞吐量', 'packet', '数据包'],
          ['routing', '路由', 'subnet mask', '子网掩码'],
          ['encryption', '加密', 'decryption', '解密'],
          ['symmetric / asymmetric', '对称/非对称', 'digital signature', '数字签名'],
          ['authentication', '认证', 'authorization', '授权'],
          ['firewall', '防火墙', 'intrusion detection', '入侵检测'],
          ['vulnerability', '漏洞', 'malware', '恶意软件'],
          ['phishing', '钓鱼', 'ransomware', '勒索软件']
        ]},
        { t: 'h', c: '5. 新技术' },
        { t: 'table', head: ['英文', '中文', '英文', '中文'], rows: [
          ['cloud computing', '云计算', 'virtualization', '虚拟化'],
          ['container', '容器', 'microservice', '微服务'],
          ['machine learning', '机器学习', 'neural network', '神经网络'],
          ['deep learning', '深度学习', 'natural language processing', '自然语言处理'],
          ['blockchain', '区块链', 'distributed ledger', '分布式账本'],
          ['low-code / no-code', '低代码/无代码', 'edge computing', '边缘计算'],
          ['Internet of Things (IoT)', '物联网', 'big data', '大数据']
        ]}
      ]
    },
    {
      id: 'ch12-3',
      title: '真题式短文精读',
      importance: 2,
      tags: ['练习'],
      blocks: [
        { t: 'p', c: '下面这篇短文按真题风格编写，用于训练“定位 + 排除”的解题节奏。' },
        { t: 'quote', c: 'Design patterns provide reusable solutions to commonly occurring problems in software design. They are not finished designs that can be transformed directly into code, but rather descriptions or templates for how to solve a problem in many different situations. The **Observer** pattern, for example, defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically. This is particularly useful in event-driven systems, where a user interface must stay consistent with the underlying data model.' },
        { t: 'p', c: '**Q1.** According to the passage, design patterns are best described as ____.' },
        { t: 'ul', items: [
          'A. finished code that can be copied directly',
          'B. **templates for solving recurring design problems**',
          'C. programming languages',
          'D. testing tools'
        ]},
        { t: 'p', c: '**解析**：原文 “They are not finished designs that can be transformed directly into code, but rather descriptions or templates”，直接对应 B；A 与原文相反。' },
        { t: 'p', c: '**Q2.** The Observer pattern defines a ____ relationship.' },
        { t: 'ul', items: ['A. one-to-one', 'B. **one-to-many**', 'C. many-to-many', 'D. zero-to-one'] },
        { t: 'p', c: '**解析**：原文 “defines a one-to-many dependency between objects”，答案 B。这类数字型细节题几乎每年都有，**看到数字立刻划线**。' }
      ]
    }
  ]
}
